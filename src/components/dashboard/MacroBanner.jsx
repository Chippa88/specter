import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Persistent macro context strip — Fed, CPI, 10y, Unemployment.
 * Skeleton uses stub values; Milestone 2 wires live FRED data.
 */
const MACRO = [
  { label: 'Fed Rate', value: '5.25%', prior: '5.25%', dir: 0 },
  { label: 'CPI YoY', value: '3.1%', prior: '3.2%', dir: -1 },
  { label: '10yr Yield', value: '4.42%', prior: '4.38%', dir: 1 },
  { label: 'Unemployment', value: '3.9%', prior: '3.8%', dir: 1 },
];

export default function MacroBanner() {
  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b border-specter bg-specter-surface/60 px-6 py-2.5 backdrop-blur-sm">
      <span className="font-mono text-[0.65rem] tracking-wider text-specter-muted">MACRO</span>
      {MACRO.map((m) => {
        const Icon = m.dir > 0 ? TrendingUp : m.dir < 0 ? TrendingDown : null;
        return (
          <div key={m.label} className="flex shrink-0 items-center gap-2 font-mono text-xs">
            <span className="text-specter-muted">{m.label}</span>
            <span className="text-data">{m.value}</span>
            {Icon && (
              <Icon
                className={`h-3 w-3 ${m.dir > 0 ? 'text-caution' : 'text-bull'}`}
                strokeWidth={2.5}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}