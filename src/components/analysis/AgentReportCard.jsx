import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

/**
 * Collapsible report card for one agent.
 * Markdown body with Specter styling.
 */
export default function AgentReportCard({ agent, report, defaultOpen = false, accentColor }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = agent.icon;

  return (
    <div className="specter-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-specter-elevated/50"
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${agent.borderClass} ${agent.bgClass}`}
        >
          <Icon className={`h-4 w-4 ${agent.colorClass}`} strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <div className="agent-label text-specter-text">{agent.name}</div>
          <p className="mt-0.5 text-xs text-specter-muted">{agent.role}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-specter-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-specter px-5 py-5">
          <div className="prose prose-sm prose-invert max-w-none
            prose-headings:font-semibold prose-headings:text-specter-text
            prose-h2:text-sm prose-h2:uppercase prose-h2:tracking-wider prose-h2:text-specter-primary prose-h2:mt-5 prose-h2:mb-2 prose-h2:first:mt-0
            prose-p:text-sm prose-p:leading-relaxed prose-p:text-specter-text/90
            prose-strong:text-specter-text prose-strong:font-semibold
            prose-li:text-sm prose-li:text-specter-text/90
            prose-ol:my-2 prose-ul:my-2">
            <ReactMarkdown>{report || '*No report available.*'}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}