import React from 'react';
import { VERDICT_STYLES } from '@/components/agents/agentRegistry';

export default function VerdictPanel({ analysis }) {
  const style = VERDICT_STYLES[analysis.final_verdict] || VERDICT_STYLES.Hold;
  const bull = analysis.bull_strength ?? 50;
  const bear = analysis.bear_strength ?? 50;
  const total = bull + bear || 1;
  const bullPct = Math.round((bull / total) * 100);
  const bearPct = 100 - bullPct;

  return (
    <div className="specter-card overflow-hidden p-7">
      <div className="agent-label text-specter-muted">VERDICT</div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div
          className={`inline-flex items-center gap-2.5 rounded-full border px-5 py-2 ${style.bg} ${style.border} ${
            style.pulse ? 'animate-specter-pulse' : ''
          }`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
          <span className={`text-lg font-bold ${style.text}`}>{analysis.final_verdict}</span>
        </div>

        <div className="ml-auto text-right">
          <div className="font-mono text-3xl font-bold text-data">
            {analysis.confidence_score}
          </div>
          <div className="agent-label text-specter-muted">CONFIDENCE</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[0.7rem] text-specter-muted">
          <span>CONFIDENCE</span>
          <span>{analysis.confidence_score} / 100</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-specter-elevated">
          <div
            className="h-full bg-specter-primary transition-all"
            style={{ width: `${analysis.confidence_score}%` }}
          />
        </div>
      </div>

      {/* Bull / Bear balance bar */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between font-mono text-xs">
          <span className="text-bull">BULL {bullPct}%</span>
          <span className="text-bear">{bearPct}% BEAR</span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-specter-elevated">
          <div className="bg-bull transition-all" style={{ width: `${bullPct}%` }} />
          <div className="bg-bear transition-all" style={{ width: `${bearPct}%` }} />
        </div>
      </div>

      {/* Reasoning */}
      {analysis.verdict_reasoning && (
        <p className="mt-6 text-sm leading-relaxed text-specter-text/90">
          {analysis.verdict_reasoning}
        </p>
      )}
    </div>
  );
}