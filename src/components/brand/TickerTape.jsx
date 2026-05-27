import React from 'react';

const TAPE = [
  { sym: 'AAPL', px: '189.42', chg: '+1.2%', up: true },
  { sym: 'MES', px: '5,241.75', chg: '+0.4%', up: true },
  { sym: 'NVDA', px: '124.18', chg: '-0.8%', up: false },
  { sym: 'QQQ', px: '478.93', chg: '+0.3%', up: true },
  { sym: 'GLD', px: '241.07', chg: '+0.5%', up: true },
  { sym: 'TSLA', px: '247.31', chg: '-2.1%', up: false },
  { sym: 'SPY', px: '563.18', chg: '+0.2%', up: true },
  { sym: 'CL', px: '78.42', chg: '-1.4%', up: false },
  { sym: 'NQ', px: '20,148.5', chg: '+0.6%', up: true },
  { sym: 'BTC', px: '67,432', chg: '+3.1%', up: true },
  { sym: 'META', px: '512.74', chg: '+0.9%', up: true },
  { sym: 'MSFT', px: '421.15', chg: '+0.1%', up: true },
];

export default function TickerTape() {
  const row = [...TAPE, ...TAPE]; // duplicate for seamless loop

  return (
    <div className="relative w-full overflow-hidden border-y border-specter bg-specter-surface/60 backdrop-blur-sm">
      <div className="flex animate-ticker whitespace-nowrap py-2.5">
        {row.map((t, i) => (
          <div
            key={i}
            className="mx-7 flex items-center gap-2 font-mono text-[0.78rem] tracking-tight"
          >
            <span className="font-semibold text-specter-text">{t.sym}</span>
            <span className="text-data">{t.px}</span>
            <span className={t.up ? 'text-bull' : 'text-bear'}>{t.chg}</span>
            <span className="ml-7 h-1 w-1 rounded-full bg-specter-border" />
          </div>
        ))}
      </div>
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-specter-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-specter-bg to-transparent" />
    </div>
  );
}