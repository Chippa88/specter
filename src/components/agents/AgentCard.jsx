import React from 'react';

/**
 * Compact agent card used on landing page "Seven minds" grid.
 */
export default function AgentCard({ agent }) {
  const Icon = agent.icon;
  return (
    <div className="specter-card specter-glow group relative overflow-hidden p-5">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${agent.borderClass} ${agent.bgClass}`}
        >
          <Icon className={`h-5 w-5 ${agent.colorClass}`} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <div className="agent-label text-specter-text">{agent.name}</div>
          <p className="mt-1.5 text-sm leading-relaxed text-specter-muted">{agent.role}</p>
        </div>
      </div>
    </div>
  );
}