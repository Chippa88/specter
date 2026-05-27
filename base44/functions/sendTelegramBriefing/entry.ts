import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * sendTelegramBriefing
 *
 * Modes:
 *   - preview=true  → builds the message, returns it, does NOT send, does NOT log
 *   - preview=false (default) → builds + sends via Telegram Bot API, logs to BriefingLog
 *
 * Pulls today's Analysis records for each ticker in the user's briefing_tickers list.
 * Uses the most recent Analysis per ticker (regardless of date) so the briefing
 * is never empty as long as the user has run something.
 *
 * Reads bot token from env: TELEGRAM_BOT_TOKEN
 * Reads chat id from UserSettings.telegram_chat_id
 */

const VERDICT_EMOJI = {
  'Strong Buy': '🟢',
  Buy: '🟢',
  Hold: '🟡',
  Avoid: '🔴',
  'Strong Avoid': '🔴',
};

function formatBriefing(dateStr, items) {
  const lines = [];
  lines.push(`👻 SPECTER BRIEFING — ${dateStr}`);
  lines.push('');

  if (items.length === 0) {
    lines.push('No analyses available for your configured tickers.');
    lines.push('Run an analysis from the dashboard to populate your briefing.');
    return lines.join('\n');
  }

  for (const it of items) {
    const emoji = VERDICT_EMOJI[it.final_verdict] || '⚪';
    lines.push(`${emoji} *${it.ticker}* — ${it.final_verdict}`);
    if (it.confidence_score != null) {
      lines.push(`   Confidence: ${it.confidence_score}/100 · Risk: ${it.risk_score ?? '—'}/10`);
    }
    if (it.verdict_reasoning) {
      const trimmed = it.verdict_reasoning.length > 220
        ? it.verdict_reasoning.slice(0, 220).trim() + '…'
        : it.verdict_reasoning;
      lines.push(`   ${trimmed}`);
    }
    lines.push('');
  }

  lines.push('— Specter · Informational only, not financial advice.');
  return lines.join('\n');
}

async function sendToTelegram(botToken, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.description || `Telegram API ${res.status}`);
  }
  return data;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const preview = body?.preview === true;

    // Load user settings
    const settingsList = await base44.entities.UserSettings.list();
    const settings = settingsList[0];

    const tickersRaw = (body?.tickers || settings?.briefing_tickers || '').trim();
    const tickers = tickersRaw
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);

    if (tickers.length === 0) {
      return Response.json(
        { error: 'no_tickers', message: 'Configure briefing tickers first.' },
        { status: 400 }
      );
    }

    // Pull most recent Analysis per ticker
    const allAnalyses = await base44.entities.Analysis.list('-created_date', 200);
    const latestByTicker = {};
    for (const a of allAnalyses) {
      if (!latestByTicker[a.ticker]) latestByTicker[a.ticker] = a;
    }
    const items = tickers
      .map((t) => latestByTicker[t])
      .filter(Boolean);

    const dateStr = new Date().toISOString().slice(0, 10);
    const content = formatBriefing(dateStr, items);

    // PREVIEW: just return the content, do not send, do not log
    if (preview) {
      return Response.json({
        preview: true,
        content,
        tickers_found: items.map((i) => i.ticker),
        tickers_missing: tickers.filter((t) => !latestByTicker[t]),
      });
    }

    // REAL SEND
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = settings?.telegram_chat_id;

    let telegramDelivered = false;
    let deliveryStatus = 'failed';
    let errorMessage = null;

    if (!botToken) {
      errorMessage = 'TELEGRAM_BOT_TOKEN is not configured.';
    } else if (!chatId) {
      errorMessage = 'No Telegram chat ID set in Settings.';
    } else {
      try {
        await sendToTelegram(botToken, chatId, content);
        telegramDelivered = true;
        deliveryStatus = 'sent';
      } catch (e) {
        errorMessage = e.message;
      }
    }

    // Always log the attempt
    const log = await base44.entities.BriefingLog.create({
      briefing_date: dateStr,
      tickers_analyzed: tickers.join(', '),
      delivery_status: deliveryStatus,
      telegram_delivered: telegramDelivered,
      briefing_content: content,
      error_message: errorMessage,
      credits_used: 0,
    });

    if (errorMessage) {
      return Response.json(
        { error: 'delivery_failed', message: errorMessage, log_id: log.id },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      log_id: log.id,
      tickers_found: items.map((i) => i.ticker),
      content,
    });
  } catch (error) {
    console.error('sendTelegramBriefing error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});