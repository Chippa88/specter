import React from 'react';
import ReactMarkdown from 'react-markdown';
import { TrendingUp, TrendingDown } from 'lucide-react';

function CaseCard({ side, body }) {
  const isBull = side === 'bull';
  const Icon = isBull ? TrendingUp : TrendingDown;
  const tone = isBull
    ? { border: 'border-[hsl(145_100%_45%/0.3)]', bg: 'bg-[hsl(145_100%_45%/0.06)]', text: 'text-bull', label: 'BULL CASE', emoji: '🐂' }
    : { border: 'border-[hsl(348_100%_54%/0.3)]', bg: 'bg-[hsl(348_100%_54%/0.06)]', text: 'text-bear', label: 'BEAR CASE', emoji: '🐻' };

  return (
    <div className={`specter-card overflow-hidden border ${tone.border}`}>
      <div className={`flex items-center gap-3 border-b ${tone.border} ${tone.bg} px-5 py-3`}>
        <span className="text-lg">{tone.emoji}</span>
        <Icon className={`h-4 w-4 ${tone.text}`} strokeWidth={2} />
        <span className={`agent-label ${tone.text}`}>{tone.label}</span>
      </div>
      <div className="px-5 py-5">
        <div className="prose prose-sm prose-invert max-w-none
          prose-headings:font-semibold
          prose-h2:text-xs prose-h2:uppercase prose-h2:tracking-wider prose-h2:mt-4 prose-h2:mb-2 prose-h2:first:mt-0
          prose-h2:text-specter-text
          prose-p:text-sm prose-p:leading-relaxed prose-p:text-specter-text/90
          prose-li:text-sm prose-li:text-specter-text/90
          prose-strong:text-specter-text">
          <ReactMarkdown>{body || '*No case available.*'}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default function BullBearCards({ bullCase, bearCase }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <CaseCard side="bull" body={bullCase} />
      <CaseCard side="bear" body={bearCase} />
    </div>
  );
}