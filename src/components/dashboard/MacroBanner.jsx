import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useMacroData, formatMacroValue, macroDirection } from '@/lib/useMacroData';

/**
 * Persistent macro context strip — Fed, CPI, 10y, Unemployment.
 * Live FRED data, cached 24h.
 */
export default function MacroBanner() {
  const { data, isLoading, error } = useMacroData();

  // Missing key — soft prompt
  const missingKey = error?.response?.data?.error === 'missing_key' ||
                     (data?.error === 'missing_key');

  if (missingKey) {
    return (
      <div className="flex items-center gap-3 border-b border-specter bg-specter-surface/60 px-6 py-2.5 backdrop-blur-sm">
        <AlertCircle className="h-3.5 w-3.5 text-caution" />
        <span className="font-mono text-[0.65rem] tracking-wider text-specter-muted">MACRO</span>
        <span className="text-xs text-specter-muted">
          Connect FRED API key to see live macro data
        </span>
        <Link
          to="/settings"
          className="ml-auto font-mono text-[0.7rem] tracking-wider text-specter-primary hover:underline"
        >
          ADD KEY →
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-6 border-b border-specter bg-specter-surface/60 px-6 py-2.5 backdrop-blur-sm">
        <span className="font-mono text-[0.65rem] tracking-wider text-specter-muted">MACRO</span>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-16 animate-pulse rounded bg-specter-elevated" />
            <div className="h-3 w-10 animate-pulse rounded bg-specter-elevated" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-3 border-b border-specter bg-specter-surface/60 px-6 py-2.5 backdrop-blur-sm">
        <AlertCircle className="h-3.5 w-3.5 text-bear" />
        <span className="font-mono text-[0.65rem] tracking-wider text-specter-muted">MACRO</span>
        <span className="text-xs text-specter-muted">Macro feed unavailable</span>
      </div>
    );
  }

  const metrics = [
    { label: 'Fed Rate', m: data.fed_rate },
    { label: 'CPI YoY', m: data.cpi_yoy },
    { label: '10yr', m: data.ten_year },
    { label: 'Unemp', m: data.unemployment },
  ];

  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b border-specter bg-specter-surface/60 px-6 py-2.5 backdrop-blur-sm">
      <span className="font-mono text-[0.65rem] tracking-wider text-specter-muted">MACRO</span>
      {metrics.map(({ label, m }) => {
        const dir = macroDirection(m?.value, m?.prior);
        const Icon = dir > 0 ? TrendingUp : dir < 0 ? TrendingDown : null;
        return (
          <div key={label} className="flex shrink-0 items-center gap-2 font-mono text-xs">
            <span className="text-specter-muted">{label}</span>
            <span className="text-data">{formatMacroValue(label, m?.value)}</span>
            {Icon && (
              <Icon
                className={`h-3 w-3 ${dir > 0 ? 'text-caution' : 'text-bull'}`}
                strokeWidth={2.5}
              />
            )}
          </div>
        );
      })}
      <span className="ml-auto hidden font-mono text-[0.65rem] text-specter-muted/60 md:inline">
        via FRED
      </span>
    </div>
  );
}