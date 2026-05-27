import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * runAgentAnalysis — the core Specter function.
 *
 * Orchestrates 7 agents sequentially. Updates an AnalysisRun record as it goes
 * so the frontend can poll progress. Saves final Analysis record on completion.
 *
 * Agents 1-4: gpt-4o-mini (cheap context-builders)
 * Agents 5-7: gpt-4o (synthesis + verdict)
 *
 * Returns: { run_id, analysis_id } on success.
 */

const AGENTS = [
  { id: 'fundamentals', name: 'Fundamentals Analyst', model: 'gpt-4o-mini' },
  { id: 'technical', name: 'Technical Analyst', model: 'gpt-4o-mini' },
  { id: 'sentiment', name: 'Sentiment Analyst', model: 'gpt-4o-mini' },
  { id: 'news', name: 'News Analyst', model: 'gpt-4o-mini' },
  { id: 'bull', name: 'Bull Researcher', model: 'gpt-4o' },
  { id: 'bear', name: 'Bear Researcher', model: 'gpt-4o' },
  { id: 'risk', name: 'Risk Manager', model: 'gpt-4o' },
];

async function callOpenAI(apiKey, model, system, user, jsonMode = false) {
  const body = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.4,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${model} failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content || '';
}

const PROMPTS = {
  fundamentals: (ticker, market) => ({
    system: 'You are Specter\'s Fundamentals Analyst. Be precise, data-driven, no fluff. Output plain markdown with clear section headers.',
    user: `Analyze ${ticker} using this market data:
${JSON.stringify(market, null, 2)}

Assess earnings quality, revenue growth trajectory, valuation vs sector peers, balance sheet health, and competitive moat strength.

Output structured report with these headers:
## Earnings Quality
## Valuation
## Growth
## Balance Sheet
## Moat

Keep each section to 3-4 concise sentences. If data is missing for a section, state that briefly and reason from what's available.`,
  }),

  technical: (ticker, market) => ({
    system: 'You are Specter\'s Technical Analyst. Be precise, signal-driven. Output plain markdown with clear section headers.',
    user: `Analyze ${ticker} using:
- Price: $${market.price}
- 52w range: $${market.week52_low} – $${market.week52_high}
- RSI(14): ${market.rsi_14}
- MACD: ${market.macd} | Signal: ${market.macd_signal} | Hist: ${market.macd_hist}
- Volume: ${market.volume}
- Day range: $${market.day_low} – $${market.day_high}

Identify trend direction, momentum strength, key support and resistance levels, overbought/oversold signals, and notable chart patterns.

Output with headers:
## Trend
## Momentum
## Key Levels
## Signals

3-4 sentences per section. Be specific with price levels.`,
  }),

  sentiment: (ticker, news) => ({
    system: 'You are Specter\'s Sentiment Analyst. Output plain markdown with clear section headers.',
    user: `Analyze sentiment for ${ticker}:
- Sentiment score: ${news.sentiment_score} (-1 bearish, +1 bullish)
- Bullish: ${news.bullish_pct}% | Bearish: ${news.bearish_pct}% | Neutral: ${news.neutral_pct}%
- Social mentions: ${news.social ? JSON.stringify(news.social) : 'unavailable'}

Recent headlines (last 7d):
${(news.headlines || []).map((h, i) => `${i + 1}. [${h.sentiment}] ${h.headline}`).join('\n')}

Output with headers:
## Sentiment Score
## Retail Mood
## Contrarian Risk
## Outlook

3-4 sentences per section.`,
  }),

  news: (ticker, news, macro) => ({
    system: 'You are Specter\'s News Analyst. Output plain markdown with clear section headers.',
    user: `Analyze news + macro context for ${ticker}:

Recent headlines:
${(news.headlines || []).slice(0, 8).map((h, i) => `${i + 1}. ${h.headline} (${h.source})`).join('\n')}

Macro context:
- Fed Rate: ${macro?.fed_rate?.value || 'n/a'}%
- CPI YoY: ${macro?.cpi_yoy?.value || 'n/a'}%
- 10yr Yield: ${macro?.ten_year?.value || 'n/a'}%
- Unemployment: ${macro?.unemployment?.value || 'n/a'}%

Assess material news risks, macro tailwinds/headwinds, and near-term event risk.

Output with headers:
## Key Headlines
## Macro Environment
## Event Risk
## News Verdict

3-4 sentences per section.`,
  }),

  bull: (ticker, reports) => ({
    system: 'You are Specter\'s Bull Researcher. Build the strongest possible long case. Be persuasive but grounded in the analyst reports. Output plain markdown.',
    user: `Build the bull case for ${ticker}.

Fundamentals report:
${reports.fundamentals}

Technical report:
${reports.technical}

Sentiment report:
${reports.sentiment}

News report:
${reports.news}

Output structure:
## Top 3 Bullish Reasons
1. ...
2. ...
3. ...

## Catalysts
What specific events drive price higher?

## Bull Price Target
Specific level and timeframe.

## Counter to Bear
Pre-emptively challenge the strongest bear arguments.

Be concrete with numbers and dates.`,
  }),

  bear: (ticker, reports) => ({
    system: 'You are Specter\'s Bear Researcher. Build the strongest possible short or avoid case. Be persuasive but grounded in the analyst reports. Output plain markdown.',
    user: `Build the bear case for ${ticker}.

Fundamentals report:
${reports.fundamentals}

Technical report:
${reports.technical}

Sentiment report:
${reports.sentiment}

News report:
${reports.news}

Output structure:
## Top 3 Risks
1. ...
2. ...
3. ...

## Drawdown Drivers
What specific events drive price lower?

## Bear Price Target
Specific level and timeframe.

## Counter to Bull
Pre-emptively challenge the strongest bull arguments.

Be concrete with numbers and dates.`,
  }),

  risk: (ticker, bull_case, bear_case, riskTolerance) => ({
    system: 'You are Specter\'s Risk Manager. You output ONLY valid JSON, no markdown, no commentary.',
    user: `Review the bull and bear cases for ${ticker} and produce a final verdict.

BULL CASE:
${bull_case}

BEAR CASE:
${bear_case}

User risk tolerance: ${riskTolerance}

Output ONLY this JSON structure (no markdown, no code fences):
{
  "risk_score": <integer 1-10, 1=very low risk 10=extreme>,
  "bull_strength": <integer 0-100>,
  "bear_strength": <integer 0-100>,
  "final_verdict": "<one of: Strong Buy | Buy | Hold | Avoid | Strong Avoid>",
  "confidence_score": <integer 1-100>,
  "max_position_pct": <number, suggested max % of portfolio>,
  "volatility_label": "<LOW | MODERATE | HIGH | EXTREME>",
  "liquidity_label": "<POOR | FAIR | GOOD | EXCELLENT>",
  "news_risk_label": "<LOW | MODERATE | ELEVATED | HIGH>",
  "verdict_reasoning": "<2-3 sentence plain-language reasoning a retail trader can act on>"
}

bull_strength and bear_strength do NOT need to sum to 100. Weight them by your assessment of argument quality and supporting data.`,
  }),
};

async function updateRun(base44, runId, patch) {
  try {
    await base44.entities.AnalysisRun.update(runId, patch);
  } catch (e) {
    console.error('updateRun failed:', e.message);
  }
}

Deno.serve(async (req) => {
  let base44, runId;
  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticker, run_id } = await req.json();
    if (!ticker || !run_id) {
      return Response.json({ error: 'ticker and run_id required' }, { status: 400 });
    }
    runId = run_id;
    const sym = ticker.toUpperCase().trim();

    // Get user's OpenAI key
    const settingsList = await base44.entities.UserSettings.list();
    const settings = settingsList[0];
    const openaiKey = settings?.openai_api_key;
    const riskTolerance = settings?.risk_tolerance || 'moderate';

    if (!openaiKey) {
      await updateRun(base44, runId, {
        status: 'failed',
        error_message: 'OpenAI API key not set. Add it in Settings.',
      });
      return Response.json({ error: 'missing_openai_key' }, { status: 400 });
    }

    // Initialize progress
    const initProgress = AGENTS.reduce((acc, a) => ({ ...acc, [a.id]: 'waiting' }), {});
    await updateRun(base44, runId, {
      status: 'running',
      agent_progress: initProgress,
      progress_pct: 0,
    });

    // === STEP 0: Fetch context data in parallel ===
    const [marketRes, newsRes, macroRes] = await Promise.all([
      base44.functions.invoke('fetchMarketData', { ticker: sym }).catch((e) => ({ data: { error: e.message } })),
      base44.functions.invoke('fetchNewsAndSentiment', { ticker: sym }).catch((e) => ({ data: { error: e.message } })),
      base44.functions.invoke('fetchMacroData', {}).catch((e) => ({ data: { error: e.message } })),
    ]);

    const market = marketRes.data || {};
    const news = newsRes.data || { headlines: [], sentiment_score: 0 };
    const macro = macroRes.data || {};

    if (market.error === 'missing_key' || news.error === 'missing_key') {
      await updateRun(base44, runId, {
        status: 'failed',
        error_message: 'Missing data API keys. Add Polygon and Finnhub keys in Settings.',
      });
      return Response.json({ error: 'missing_data_keys' }, { status: 400 });
    }

    const reports = {};
    const progress = { ...initProgress };

    // === Run agents sequentially ===
    const runAgent = async (idx, fn) => {
      const agent = AGENTS[idx];
      progress[agent.id] = 'running';
      await updateRun(base44, runId, {
        current_agent: agent.id,
        agent_progress: progress,
        progress_pct: Math.round((idx / AGENTS.length) * 100),
      });

      try {
        const result = await fn(agent);
        reports[agent.id] = result;
        progress[agent.id] = 'complete';
        await updateRun(base44, runId, {
          agent_progress: progress,
          progress_pct: Math.round(((idx + 1) / AGENTS.length) * 100),
        });
      } catch (e) {
        progress[agent.id] = 'failed';
        await updateRun(base44, runId, { agent_progress: progress });
        throw e;
      }
    };

    // 1 Fundamentals
    await runAgent(0, async (a) => {
      const p = PROMPTS.fundamentals(sym, market);
      return await callOpenAI(openaiKey, a.model, p.system, p.user);
    });

    // 2 Technical
    await runAgent(1, async (a) => {
      const p = PROMPTS.technical(sym, market);
      return await callOpenAI(openaiKey, a.model, p.system, p.user);
    });

    // 3 Sentiment
    await runAgent(2, async (a) => {
      const p = PROMPTS.sentiment(sym, news);
      return await callOpenAI(openaiKey, a.model, p.system, p.user);
    });

    // 4 News
    await runAgent(3, async (a) => {
      const p = PROMPTS.news(sym, news, macro);
      return await callOpenAI(openaiKey, a.model, p.system, p.user);
    });

    // 5 Bull
    await runAgent(4, async (a) => {
      const p = PROMPTS.bull(sym, reports);
      return await callOpenAI(openaiKey, a.model, p.system, p.user);
    });

    // 6 Bear
    await runAgent(5, async (a) => {
      const p = PROMPTS.bear(sym, reports);
      return await callOpenAI(openaiKey, a.model, p.system, p.user);
    });

    // 7 Risk Manager (JSON mode)
    await runAgent(6, async (a) => {
      const p = PROMPTS.risk(sym, reports.bull, reports.bear, riskTolerance);
      return await callOpenAI(openaiKey, a.model, p.system, p.user, true);
    });

    // Parse risk JSON
    let riskData;
    try {
      riskData = JSON.parse(reports.risk);
    } catch (e) {
      console.error('Risk JSON parse failed:', reports.risk?.slice(0, 200));
      throw new Error('Risk Manager returned invalid JSON');
    }

    // Save Analysis record
    const analysis = await base44.entities.Analysis.create({
      ticker: sym,
      analysis_date: new Date().toISOString().slice(0, 10),
      fundamentals_report: reports.fundamentals,
      technical_report: reports.technical,
      sentiment_report: reports.sentiment,
      news_report: reports.news,
      bull_case: reports.bull,
      bear_case: reports.bear,
      risk_score: riskData.risk_score,
      final_verdict: riskData.final_verdict,
      verdict_reasoning: riskData.verdict_reasoning,
      confidence_score: riskData.confidence_score,
      bull_strength: riskData.bull_strength,
      bear_strength: riskData.bear_strength,
      data_sources: JSON.stringify({
        market: !market.error,
        news: !news.error,
        macro: !macro.error,
        risk_extra: {
          max_position_pct: riskData.max_position_pct,
          volatility_label: riskData.volatility_label,
          liquidity_label: riskData.liquidity_label,
          news_risk_label: riskData.news_risk_label,
          current_price: market.price,
          change_pct: market.change_pct,
          company_name: market.name,
        },
      }),
      model_used: 'gpt-4o-mini + gpt-4o',
    });

    // Mark run complete
    await updateRun(base44, runId, {
      status: 'complete',
      progress_pct: 100,
      analysis_id: analysis.id,
      current_agent: null,
    });

    return Response.json({ run_id: runId, analysis_id: analysis.id });
  } catch (error) {
    console.error('runAgentAnalysis error:', error.message);
    if (runId && base44) {
      await updateRun(base44, runId, {
        status: 'failed',
        error_message: error.message,
      });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});