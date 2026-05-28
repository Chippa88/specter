import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import BriefingConfig from './BriefingConfig';
import BriefingHistory from './BriefingHistory';
import BriefingPreviewDialog from './BriefingPreviewDialog';

export default function BriefingsTab() {
  const qc = useQueryClient();
  const [previewData, setPreviewData] = useState(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['briefing-logs'],
    queryFn: () => base44.entities.BriefingLog.list('-created_date', 50),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Daily Briefings</h2>
        <p className="mt-1 text-sm text-specter-muted">
          Specter delivers a structured briefing to Telegram every morning.
        </p>
      </div>

      <BriefingConfig
        onSent={() => qc.invalidateQueries({ queryKey: ['briefing-logs'] })}
        onPreview={(data) => setPreviewData(data)}
      />

      <BriefingHistory logs={logs} isLoading={isLoading} />

      <BriefingPreviewDialog
        open={!!previewData}
        onOpenChange={(o) => !o && setPreviewData(null)}
        data={previewData}
      />
    </div>
  );
}