import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * fetchNewsAndSentiment — recent news + sentiment via Finnhub.
 * Free tier: 60 req/min.
 *
 * Returns:
 *   headlines: [{ headline, source, url, datetime, summary, sentiment }]
 *   sentiment_score: -1 to 1
 *   bullish_pct, bearish_pct, neutral_pct
 */

const FINN = 'https://finnhub.io/api/v1';

function classifyHeadline(text) {
  // Lightweight rules-based fallback for free-tier news rows
  const t = (text || '').toLowerCase();
  const bullWords = ['beat', 'surge', 'soar', 'rally', 'upgrade', 'record', 'growth', 'jump', 'gain', 'rise', 'strong', 'outperform'];
  const bearWords = ['miss', 'plunge', 'crash', 'fall', 'downgrade', 'lawsuit', 'investigation', 'cut', 'slump', 'weak', 'underperform', 'decline'];
  let score = 0;
  bullWords.forEach((w) => { if (t.includes(w)) score += 1; });
  bearWords.forEach((w) => { if (t.includes(w)) score -= 1; });
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticker } = await req.json();
    if (!ticker) {
      return Response.json({ error: 'ticker_required' }, { status: 400 });
    }

    const settingsList = await base44.entities.UserSettings.list();
    const settings = settingsList[0];
    const apiKey = settings?.finnhub_api_key;

    if (!apiKey) {
      return Response.json(
        { error: 'missing_key', message: 'Finnhub API key not set. Add it in Settings.' },
        { status: 400 }
      );
    }

    const sym = ticker.toUpperCase().trim();

    // Date range — last 7 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    const fmt = (d) => d.toISOString().slice(0, 10);

    const newsUrl = `${FINN}/company-news?symbol=${sym}&from=${fmt(start)}&to=${fmt(end)}&token=${apiKey}`;
    const newsRes = await fetch(newsUrl);
    if (!newsRes.ok) {
      const text = await newsRes.text();
      throw new Error(`Finnhub news failed: ${newsRes.status} ${text.slice(0, 120)}`);
    }
    const newsJson = await newsRes.json();
    const rows = Array.isArray(newsJson) ? newsJson.slice(0, 10) : [];

    const headlines = rows.map((r) => {
      const sentiment = classifyHeadline(`${r.headline} ${r.summary || ''}`);
      return {
        headline: r.headline,
        source: r.source,
        url: r.url,
        datetime: r.datetime ? new Date(r.datetime * 1000).toISOString() : null,
        summary: (r.summary || '').slice(0, 280),
        sentiment,
      };
    });

    const counts = { positive: 0, negative: 0, neutral: 0 };
    headlines.forEach((h) => { counts[h.sentiment]++; });
    const total = headlines.length || 1;
    const sentiment_score = parseFloat(
      (((counts.positive - counts.negative) / total)).toFixed(2)
    );

    // Try Finnhub's social sentiment endpoint (may be premium-gated)
    let social = null;
    try {
      const sUrl = `${FINN}/stock/social-sentiment?symbol=${sym}&token=${apiKey}`;
      const sRes = await fetch(sUrl);
      if (sRes.ok) {
        const sJson = await sRes.json();
        if (sJson?.reddit?.length || sJson?.twitter?.length) {
          social = {
            reddit_mentions: sJson.reddit?.reduce((a, b) => a + (b.mention || 0), 0) || 0,
            twitter_mentions: sJson.twitter?.reduce((a, b) => a + (b.mention || 0), 0) || 0,
          };
        }
      }
    } catch {
      // ignore — premium feature
    }

    return Response.json({
      ticker: sym,
      headlines,
      sentiment_score,
      bullish_pct: parseFloat(((counts.positive / total) * 100).toFixed(1)),
      bearish_pct: parseFloat(((counts.negative / total) * 100).toFixed(1)),
      neutral_pct: parseFloat(((counts.neutral / total) * 100).toFixed(1)),
      social,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('fetchNewsAndSentiment error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});