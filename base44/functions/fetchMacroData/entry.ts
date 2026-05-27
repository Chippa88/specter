import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * fetchMacroData — pulls macro context from FRED.
 * Series: DFF (Fed funds), CPIAUCSL (CPI), UNRATE (unemployment), DGS10 (10y yield).
 * Caches result on the user's most recent BriefingLog-style key via a simple in-memory map
 * is not durable across cold starts, so we cache by reading the user's last macro fetch
 * from a small UserSettings-stored timestamp (simple approach).
 *
 * For Milestone 2 we keep it simple: hit FRED on every call but be efficient.
 * The frontend can throttle by caching the response in React Query for 24h.
 */

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

async function fredLatest(apiKey, seriesId) {
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FRED ${seriesId} failed: ${res.status}`);
  }
  const json = await res.json();
  const obs = json.observations || [];
  const latest = obs[0];
  const prior = obs[1];
  return {
    value: latest && latest.value !== '.' ? parseFloat(latest.value) : null,
    prior: prior && prior.value !== '.' ? parseFloat(prior.value) : null,
    date: latest ? latest.date : null,
  };
}

// Compute YoY % change for a series (used for CPI)
async function fredYoY(apiKey, seriesId) {
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=14`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED ${seriesId} YoY failed: ${res.status}`);
  const json = await res.json();
  const obs = (json.observations || []).filter((o) => o.value !== '.');
  if (obs.length < 13) return { value: null, prior: null, date: null };
  const latest = parseFloat(obs[0].value);
  const yearAgo = parseFloat(obs[12].value);
  const priorLatest = parseFloat(obs[1].value);
  const priorYearAgo = parseFloat(obs[13]?.value || obs[12].value);
  const yoy = ((latest - yearAgo) / yearAgo) * 100;
  const priorYoy = ((priorLatest - priorYearAgo) / priorYearAgo) * 100;
  return {
    value: parseFloat(yoy.toFixed(2)),
    prior: parseFloat(priorYoy.toFixed(2)),
    date: obs[0].date,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's FRED API key
    const settingsList = await base44.entities.UserSettings.list();
    const settings = settingsList[0];
    const apiKey = settings?.fred_api_key;

    if (!apiKey) {
      return Response.json(
        { error: 'missing_key', message: 'FRED API key not set. Add it in Settings.' },
        { status: 400 }
      );
    }

    // Pull all four series in parallel
    const [fedRate, cpi, tenYear, unemployment] = await Promise.all([
      fredLatest(apiKey, 'DFF'),
      fredYoY(apiKey, 'CPIAUCSL'),
      fredLatest(apiKey, 'DGS10'),
      fredLatest(apiKey, 'UNRATE'),
    ]);

    return Response.json({
      fed_rate: fedRate,
      cpi_yoy: cpi,
      ten_year: tenYear,
      unemployment: unemployment,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('fetchMacroData error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});