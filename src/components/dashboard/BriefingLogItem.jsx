import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

const STATUS_STYLES = {
  sent: { icon: CheckCircle2, label: 'Sent', className: 'border-bull/40 bg-bull/10 text-bull' },
  failed: { icon: XCircle, label: 'Failed', className: 'border-bear/40 bg-bear/10 text-bear' },
  pending: { icon: Clock, label: 'Pending', className: 'border-specter bg-specter-elevated text-specter-muted' },
};

export default function BriefingLogItem({ log }) {
  const [open, setOpen] = useState(false);
  const status = STATUS_STYLES[log.delivery_status] || STATUS_STYLES.pending;
  const StatusIcon = status.icon;

  const sentAt = log.created_date
    ? new Date(log.created_date).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : log.briefing_date;

  return (
    <div className="border-b border-specter last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-specter-elevated/40"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-specter-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-specter-muted" />
        )}
        <span className="font-mono text-xs text-specter-muted">{sentAt}</span>
        <span className="flex-1 truncate font-mono text-sm text-specter-text">
          {log.tickers_analyzed || '—'}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase ${status.className}`}
        >
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
      </button>

      {open && (
        <div className="border-t border-specter bg-specter-bg/50 px-5 py-4">
          {log.error_message && (
            <div className="mb-3 rounded-md border border-bear/40 bg-bear/5 p-3 text-xs text-bear">
              <span className="font-semibold">Error:</span> {log.error_message}
            </div>
          )}
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-specter-text">
            {log.briefing_content || '(no content)'}
          </pre>
        </div>
      )}
    </div>
  );
}