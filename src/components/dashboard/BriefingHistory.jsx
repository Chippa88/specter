import React from 'react';
import { Bell } from 'lucide-react';
import BriefingLogItem from './BriefingLogItem';
import EmptyState from './EmptyState';

export default function BriefingHistory({ logs, isLoading }) {
  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-lg bg-specter-surface" />;
  }

  if (!logs || logs.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No briefings sent yet"
        description="Configure your briefing above. Past briefings will appear here with delivery status — click to expand and read the full content."
      />
    );
  }

  return (
    <div className="specter-card overflow-hidden">
      <div className="border-b border-specter bg-specter-elevated/40 px-5 py-2.5">
        <span className="agent-label text-specter-text">Briefing History</span>
      </div>
      <div>
        {logs.map((log) => (
          <BriefingLogItem key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}