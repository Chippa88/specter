import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, AlertCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMacroData, formatMacroValue, macroDirection } from '@/lib/useMacroData';

const META = {
  fed_rate: {
    label: 'Fed Funds Rate',
    context: (v) =>
      v >= 5
        ? 'Holding at restrictive levels. Watch for any dovish pivot signals.'
        : 'Accommodative stance. Liquidity tailwind for risk assets.',
  },
  cpi_yoy: {
    label: 'CPI YoY',
    context: (v) =>
      v > 3
        ? 'Inflation above Fed 2% target. Sticky pricing risk remains.'
        : 'Disinflation trajectory intact. Supportive for rate cuts.',
  },
  ten_year: {
    label: '10yr Treasury',
    context: (v) =>
      v > 4.5
        ? 'Long-end firm. Headwind for high-duration equities.'
        : 'Yields well-behaved. Constructive for growth multiples.',
  },
  unemployment: {
    label: 'Unemployment',
    context: (v) =>
      v < 4
        ? 'Labor market tight. Wage pressure could re-ignite inflation.'
        : 'Labor market softening. Watch for recession signal.',
  },
};

function MacroCard({ id, m }) {
  const meta = META[id];
  const dir = macroDirection(m?.value, m?.prior);
  const Icon = dir > 0 ? TrendingUp : dir < 0 ? TrendingDown : Minus;
  const tone = dir > 0 ? 'text-caution' : dir < 0 ? 'text-bull' : 'text-specter-muted';

  return (
    <div className="specter-card p-6">
      <div className="flex items-center justify-between">
        <div className="agent-label text-specter-muted">{meta.label}</div>
        <Icon className={`h-4 w-4 ${tone}`} strokeWidth={2} />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-data">
          {formatMacroValue(id, m?.value)}
        </span>
        {m?.prior != null && (
          <span className="font-mono text-xs text-specter-muted">prev {m.prior.toFixed(2)}%</span>
        )}
      </div>
      {m?.date && (
        <p className="mt-1 font-mono text-[0.65rem] text-specter-muted/70">{m.date}</p>
      )}
      <p className="mt-4 text-xs leading-relaxed text-specter-muted">
        {m?.value != null ? meta.context(m.value) : 'Data unavailable.'}
      </p>
    </div>
  );
}

export default function MacroTab() {
  const { data, isLoading, error, refetch } = useMacroData();

  const missingKey = error?.response?.data?.error === 'missing_key';

  if (missingKey) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Macro Context</h2>
          <p className="mt-1 text-sm text-specter-muted">
            Live macro readings from FRED — Fed Rate, CPI, yields, unemployment.
          </p>
        </div>
        <div className="specter-card flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-specter bg-specter-elevated">
            <KeyRound className="h-5 w-5 text-specter-muted" strokeWidth={1.75} />
          </div>
          <h3 className="text-base font-semibold">Connect FRED to unlock macro</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-specter-muted">
            Specter pulls Fed Rate, CPI, 10-year yields, and unemployment from FRED. Free key, no credit card.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/settings">
              <Button className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
                Add FRED key
              </Button>
            </Link>
            <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noreferrer">
              <Button variant="ghost" className="border border-specter text-specter-text hover:bg-specter-elevated">
                Get a key
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Macro Context</h2>
          <p className="mt-1 text-sm text-specter-muted">Loading live data from FRED...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="specter-card p-6">
              <div className="h-3 w-24 animate-pulse rounded bg-specter-elevated" />
              <div className="mt-3 h-9 w-20 animate-pulse rounded bg-specter-elevated" />
              <div className="mt-4 h-3 w-full animate-pulse rounded bg-specter-elevated" />
              <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-specter-elevated" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Macro Context</h2>
        </div>
        <div className="specter-card flex flex-col items-center px-6 py-20 text-center">
          <AlertCircle className="mb-4 h-8 w-8 text-bear" />
          <h3 className="text-base font-semibold">Macro feed unavailable</h3>
          <p className="mt-2 text-sm text-specter-muted">
            FRED couldn't be reached. Check your key or try again.
          </p>
          <Button
            onClick={() => refetch()}
            className="mt-6 bg-specter-primary text-specter-bg hover:bg-specter-primary/90"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Macro Context</h2>
          <p className="mt-1 text-sm text-specter-muted">
            Live macro readings from FRED. Updated every 24 hours.
          </p>
        </div>
        {data.fetched_at && (
          <p className="font-mono text-[0.7rem] text-specter-muted">
            FETCHED {new Date(data.fetched_at).toLocaleString()}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MacroCard id="fed_rate" m={data.fed_rate} />
        <MacroCard id="cpi_yoy" m={data.cpi_yoy} />
        <MacroCard id="ten_year" m={data.ten_year} />
        <MacroCard id="unemployment" m={data.unemployment} />
      </div>
    </div>
  );
}