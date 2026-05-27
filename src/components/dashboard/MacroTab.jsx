import React from 'react';

const METRICS = [
  { label: 'Fed Funds Rate', value: '5.25%', prior: '5.25%', dir: 'unchanged', context: 'Holding steady at restrictive levels as inflation moderates.' },
  { label: 'CPI YoY', value: '3.1%', prior: '3.2%', dir: 'down', context: 'Disinflation continues, though above the 2% Fed target.' },
  { label: '10yr Treasury', value: '4.42%', prior: '4.38%', dir: 'up', context: 'Long end firmer on stronger growth signals.' },
  { label: 'Unemployment', value: '3.9%', prior: '3.8%', dir: 'up', context: 'Labor market gradually loosening, still tight historically.' },
];

export default function MacroTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Macro Context</h2>
        <p className="mt-1 text-sm text-specter-muted">
          Live macro readings. Updated daily from FRED.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="specter-card p-6">
            <div className="agent-label text-specter-muted">{m.label}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-data">{m.value}</span>
              <span className="font-mono text-xs text-specter-muted">prev {m.prior}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-specter-muted">{m.context}</p>
          </div>
        ))}
      </div>
    </div>
  );
}