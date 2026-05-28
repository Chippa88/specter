import React from 'react';
import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';
import { AGENTS } from '@/components/agents/agentRegistry';

/**
 * Live progress panel — shown during the 30-60s agent run.
 * Renders all 7 agents with their current status.
 */
export default function AgentProgressPanel({ run }) {
  const progress = run?.agent_progress || {};
  const pct = run?.progress_pct || 0;
  const failed = run?.status === 'failed';

  return (
    <div className="specter-card p-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="agent-label text-specter-primary">SPECTER IS WATCHING</div>
          <h3 className="mt-1 text-lg font-semibold">
            Analyzing <span className="font-mono text-data">{run?.ticker}</span>
          </h3>
        </div>
        <div className="text-right">
          <div className="font-mono text-3xl font-bold text-data">{pct}%</div>
          <div className="agent-label text-specter-muted">PROGRESS</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1 overflow-hidden rounded-full bg-specter-elevated">
        <div
          className="h-full bg-specter-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Agent rows */}
      <div className="space-y-2">
        {AGENTS.map((a) => {
          const status = progress[a.id] || 'waiting';
          const Icon = a.icon;

          let StatusIcon, statusClass, label;
          if (status === 'complete') {
            StatusIcon = Check;
            statusClass = 'text-bull';
            label = 'complete';
          } else if (status === 'running') {
            StatusIcon = Loader2;
            statusClass = 'text-specter-primary animate-spin';
            label = 'running...';
          } else if (status === 'failed') {
            StatusIcon = AlertCircle;
            statusClass = 'text-bear';
            label = 'failed';
          } else {
            StatusIcon = Circle;
            statusClass = 'text-specter-muted/40';
            label = 'waiting';
          }

          const active = status === 'running';

          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                active
                  ? 'border-specter-primary/40 bg-specter-primary/5'
                  : 'border-specter bg-specter-elevated/40'
              }`}
            >
              <Icon className={`h-4 w-4 ${a.colorClass}`} strokeWidth={1.75} />
              <span className="agent-label text-specter-text">{a.name}</span>
              <span className="ml-auto flex items-center gap-2">
                <span className={`font-mono text-[0.7rem] ${
                  status === 'complete' ? 'text-bull' :
                  status === 'running' ? 'text-specter-primary' :
                  status === 'failed' ? 'text-bear' :
                  'text-specter-muted'
                }`}>
                  {label}
                </span>
                <StatusIcon className={`h-4 w-4 ${statusClass}`} strokeWidth={2} />
              </span>
            </div>
          );
        })}
      </div>

      {failed && run?.error_message && (
        <div className="mt-5 rounded-md border border-bear/40 bg-bear/5 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bear" />
            <p className="text-xs leading-relaxed text-specter-text/90">{run.error_message}</p>
          </div>
        </div>
      )}

      <p className="mt-5 text-center font-mono text-[0.65rem] tracking-wider text-specter-muted">
        TYPICAL RUNTIME: 30–60 SECONDS
      </p>
    </div>
  );
}