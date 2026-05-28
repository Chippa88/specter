import React from 'react';

function RiskArc({ score }) {
  // Semi-circle gauge: 1 → 10. Color shifts green → yellow → red.
  const pct = Math.max(0, Math.min(10, score)) / 10;
  const angle = pct * 180; // degrees
  const radius = 70;
  const cx = 90;
  const cy = 90;

  // Endpoint of arc
  const rad = ((angle - 180) * Math.PI) / 180;
  const x2 = cx + radius * Math.cos(rad);
  const y2 = cy + radius * Math.sin(rad);
  const largeArc = angle > 180 ? 1 : 0;

  const color =
    score <= 3 ? 'hsl(145 100% 45%)' :
    score <= 6 ? 'hsl(41 100% 50%)' :
    score <= 8 ? 'hsl(24 95% 53%)' :
    'hsl(348 100% 54%)';

  return (
    <svg width="180" height="110" viewBox="0 0 180 110">
      {/* Track */}
      <path
        d={`M 20 90 A ${radius} ${radius} 0 0 1 160 90`}
        fill="none"
        stroke="hsl(240 24% 14%)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M 20 90 A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        style={{ transition: 'all 600ms ease-out' }}
      />
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        className="fill-data"
        style={{ fontFamily: 'JetBrains Mono', fontSize: 28, fontWeight: 700 }}
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', fill: 'hsl(220 9% 47%)' }}
      >
        / 10
      </text>
    </svg>
  );
}

export default function RiskPanel({ analysis }) {
  const extra = (() => {
    try {
      return JSON.parse(analysis.data_sources || '{}').risk_extra || {};
    } catch {
      return {};
    }
  })();

  const rows = [
    { label: 'Volatility', value: extra.volatility_label || '—' },
    { label: 'Liquidity', value: extra.liquidity_label || '—' },
    { label: 'News Risk', value: extra.news_risk_label || '—' },
  ];

  return (
    <div className="specter-card p-7">
      <div className="agent-label mb-4 text-specter-muted">RISK ASSESSMENT</div>

      <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
        <div className="flex flex-col items-center">
          <RiskArc score={analysis.risk_score || 5} />
          <div className="agent-label text-specter-muted">RISK SCORE</div>
        </div>

        <div className="flex-1 space-y-3">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between border-b border-specter pb-2 last:border-0">
              <span className="text-sm text-specter-muted">{r.label}</span>
              <span className="font-mono text-xs font-semibold tracking-wider text-specter-text">
                {r.value}
              </span>
            </div>
          ))}
          {extra.max_position_pct != null && (
            <div className="mt-4 rounded-md border border-specter bg-specter-elevated/40 p-3">
              <div className="agent-label text-specter-muted">SUGGESTED MAX POSITION</div>
              <div className="mt-1 font-mono text-xl font-bold text-data">
                {extra.max_position_pct}%
              </div>
              <p className="mt-0.5 text-[0.7rem] text-specter-muted">of portfolio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}