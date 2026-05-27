import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * fetchTickerSearch — Polygon ticker autocomplete.
 * Returns matching tickers for a search query.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();
    if (!query || query.length < 1) {
      return Response.json({ results: [] });
    }

    const settingsList = await base44.entities.UserSettings.list();
    const apiKey = settingsList[0]?.polygon_api_key;
    if (!apiKey) {
      return Response.json({ error: 'missing_key' }, { status: 400 });
    }

    const url = `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=10&apiKey=${apiKey}`;
    const res = await fetch(url);

    if (res.status === 429) return Response.json({ results: [], rate_limited: true });
    if (!res.ok) {
      const text = await res.text();
      return Response.json({ error: `polygon_${res.status}`, detail: text.slice(0, 200) }, { status: 500 });
    }

    const data = await res.json();
    const results = (data.results || []).map((r) => ({
      ticker: r.ticker,
      name: r.name,
      market: r.market,
      type: r.type,
      exchange: r.primary_exchange,
    }));

    return Response.json({ results });
  } catch (error) {
    console.error('fetchTickerSearch error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});