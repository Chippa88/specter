import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * fetchBatchPrices — fetch previous-close prices for multiple tickers.
 * Used by watchlist and portfolio for live P&L.
 *
 * Input: { tickers: ["AAPL", "NVDA", ...] }
 * Output: { prices: { AAPL: { price, change_pct, prev_close }, ... } }
 *
 * Polygon free tier = 5 req/min. We serialize and tolerate 429s.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tickers } = await req.json();
    if (!Array.isArray(tickers) || tickers.length === 0) {
      return Response.json({ prices: {} });
    }

    const settingsList = await base44.entities.UserSettings.list();
    const apiKey = settingsList[0]?.polygon_api_key;
    if (!apiKey) {
      return Response.json({ error: 'missing_key', prices: {} }, { status: 400 });
    }

    const prices = {};
    // Serialize calls — fail soft per ticker
    for (const t of tickers.slice(0, 20)) {
      const sym = t.toUpperCase().trim();
      try {
        const res = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${sym}/prev?apiKey=${apiKey}`
        );
        if (res.status === 429) {
          prices[sym] = { rate_limited: true };
          continue;
        }
        if (!res.ok) {
          prices[sym] = { error: `status_${res.status}` };
          continue;
        }
        const data = await res.json();
        const r = data.results?.[0];
        if (r) {
          const change_pct = r.o ? parseFloat((((r.c - r.o) / r.o) * 100).toFixed(2)) : null;
          prices[sym] = {
            price: r.c,
            prev_close: r.c,
            day_open: r.o,
            day_high: r.h,
            day_low: r.l,
            change_pct,
          };
        } else {
          prices[sym] = { error: 'no_data' };
        }
      } catch (e) {
        prices[sym] = { error: e.message };
      }
    }

    return Response.json({ prices, fetched_at: new Date().toISOString() });
  } catch (error) {
    console.error('fetchBatchPrices error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});