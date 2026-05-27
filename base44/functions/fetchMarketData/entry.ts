import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * fetchMarketData — price, fundamentals, technicals via Polygon.io.
 * Free tier: 5 calls/min — we serialize calls and accept partial data on rate-limit.
 *
 * Returns:
 *   price, prev_close, change_pct, day_high, day_low,
 *   week52_high, week52_low, volume,
 *   rsi_14, macd, macd_signal, macd_hist,
 *   market_cap, pe_ratio, eps, name, exchange
 */

const POLY = 'https://api.polygon.io';

async function polyFetch(path, apiKey) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${POLY}${path}${sep}apiKey=${apiKey}`);
  if (res.status === 429) {
    return { _rateLimited: true };
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Polygon ${path} failed: ${res.status} ${text.slice(0, 120)}`);
  }
  return res.json();
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
    const apiKey = settings?.polygon_api_key;

    if (!apiKey) {
      return Response.json(
        { error: 'missing_key', message: 'Polygon.io API key not set. Add it in Settings.' },
        { status: 400 }
      );
    }

    const sym = ticker.toUpperCase().trim();

    // Helper to delay between calls (Polygon free tier = 5 req/min ≈ 12s spacing).
    // We won't sleep 12s here — instead we hit endpoints back-to-back and degrade gracefully on 429.
    const data = {
      ticker: sym,
      name: null,
      exchange: null,
      price: null,
      prev_close: null,
      change_pct: null,
      day_high: null,
      day_low: null,
      volume: null,
      week52_high: null,
      week52_low: null,
      rsi_14: null,
      macd: null,
      macd_signal: null,
      macd_hist: null,
      market_cap: null,
      pe_ratio: null,
      eps: null,
      revenue_ttm: null,
      partial: false,
      fetched_at: new Date().toISOString(),
    };

    // 1. Reference ticker metadata
    try {
      const ref = await polyFetch(`/v3/reference/tickers/${sym}`, apiKey);
      if (ref._rateLimited) data.partial = true;
      else {
        data.name = ref.results?.name || null;
        data.exchange = ref.results?.primary_exchange || null;
        data.market_cap = ref.results?.market_cap || null;
      }
    } catch (e) {
      console.warn('ref failed:', e.message);
      data.partial = true;
    }

    // 2. Previous close + change
    try {
      const prev = await polyFetch(`/v2/aggs/ticker/${sym}/prev`, apiKey);
      if (prev._rateLimited) data.partial = true;
      else if (prev.results?.[0]) {
        const r = prev.results[0];
        data.prev_close = r.c;
        data.price = r.c;
        data.day_high = r.h;
        data.day_low = r.l;
        data.volume = r.v;
        if (r.o) {
          data.change_pct = parseFloat((((r.c - r.o) / r.o) * 100).toFixed(2));
        }
      }
    } catch (e) {
      console.warn('prev failed:', e.message);
      data.partial = true;
    }

    // 3. 52-week range from daily aggregates
    try {
      const end = new Date();
      const start = new Date();
      start.setFullYear(start.getFullYear() - 1);
      const fmt = (d) => d.toISOString().slice(0, 10);
      const agg = await polyFetch(
        `/v2/aggs/ticker/${sym}/range/1/day/${fmt(start)}/${fmt(end)}?adjusted=true&sort=asc&limit=400`,
        apiKey
      );
      if (agg._rateLimited) data.partial = true;
      else if (agg.results?.length) {
        const highs = agg.results.map((b) => b.h);
        const lows = agg.results.map((b) => b.l);
        data.week52_high = Math.max(...highs);
        data.week52_low = Math.min(...lows);
        // Use most recent close as price if prev didn't return
        if (!data.price) data.price = agg.results[agg.results.length - 1].c;
      }
    } catch (e) {
      console.warn('aggs failed:', e.message);
      data.partial = true;
    }

    // 4. RSI 14
    try {
      const rsi = await polyFetch(
        `/v1/indicators/rsi/${sym}?timespan=day&window=14&series_type=close&order=desc&limit=1`,
        apiKey
      );
      if (rsi._rateLimited) data.partial = true;
      else if (rsi.results?.values?.[0]) {
        data.rsi_14 = parseFloat(rsi.results.values[0].value.toFixed(2));
      }
    } catch (e) {
      console.warn('rsi failed:', e.message);
      data.partial = true;
    }

    // 5. MACD
    try {
      const macd = await polyFetch(
        `/v1/indicators/macd/${sym}?timespan=day&short_window=12&long_window=26&signal_window=9&series_type=close&order=desc&limit=1`,
        apiKey
      );
      if (macd._rateLimited) data.partial = true;
      else if (macd.results?.values?.[0]) {
        const v = macd.results.values[0];
        data.macd = parseFloat(v.value.toFixed(3));
        data.macd_signal = parseFloat(v.signal.toFixed(3));
        data.macd_hist = parseFloat(v.histogram.toFixed(3));
      }
    } catch (e) {
      console.warn('macd failed:', e.message);
      data.partial = true;
    }

    // 6. Fundamentals (financials) — paid plan-gated on Polygon, attempt and tolerate failure
    try {
      const fin = await polyFetch(
        `/vX/reference/financials?ticker=${sym}&limit=1&timeframe=quarterly`,
        apiKey
      );
      if (!fin._rateLimited && fin.results?.[0]) {
        const f = fin.results[0].financials || {};
        data.eps = f.income_statement?.basic_earnings_per_share?.value || null;
        data.revenue_ttm = f.income_statement?.revenues?.value || null;
        if (data.eps && data.price) {
          data.pe_ratio = parseFloat((data.price / data.eps).toFixed(2));
        }
      }
    } catch (e) {
      console.warn('financials unavailable:', e.message);
    }

    return Response.json(data);
  } catch (error) {
    console.error('fetchMarketData error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});