import React from 'react';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Shows the preview of today's briefing — the exact message that would be sent.
 */
export default function BriefingPreviewDialog({ open, onOpenChange, data }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-specter bg-specter-surface p-0 text-specter-text">
        <DialogTitle className="sr-only">Briefing Preview</DialogTitle>
        <div className="flex items-center gap-2 border-b border-specter px-5 py-3">
          <Eye className="h-4 w-4 text-specter-primary" />
          <span className="agent-label text-specter-text">Preview — Not Sent</span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-5">
          {data?.tickers_missing?.length > 0 && (
            <div className="mb-4 rounded-md border border-caution/40 bg-caution/5 p-3 text-xs text-specter-text">
              <span className="font-semibold text-caution">No analysis found for:</span>{' '}
              <span className="font-mono">{data.tickers_missing.join(', ')}</span>
              <p className="mt-1 text-specter-muted">Run an analysis for these tickers to include them in your briefing.</p>
            </div>
          )}

          <pre className="whitespace-pre-wrap break-words rounded-md border border-specter bg-specter-bg p-4 font-mono text-xs leading-relaxed text-specter-text">
            {data?.content || '(no content)'}
          </pre>
        </div>

        <div className="flex justify-end border-t border-specter px-5 py-3">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}