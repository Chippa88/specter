import React from 'react';
import { Send, Eye, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import EmptyState from './EmptyState';

export default function BriefingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Daily Briefings</h2>
        <p className="mt-1 text-sm text-specter-muted">
          Specter delivers a structured briefing to Telegram every morning.
        </p>
      </div>

      <div className="specter-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="agent-label text-specter-muted">Daily Briefing</div>
            <p className="mt-1 text-sm text-specter-text">Send every day to Telegram</p>
          </div>
          <Switch />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="agent-label mb-2 block text-specter-muted">Delivery Time</label>
            <Input
              type="time"
              defaultValue="08:00"
              className="border-specter bg-specter-elevated font-mono text-specter-text"
            />
          </div>
          <div>
            <label className="agent-label mb-2 block text-specter-muted">Tickers (comma separated)</label>
            <Input
              placeholder="AAPL, NVDA, MES"
              className="border-specter bg-specter-elevated font-mono text-specter-text placeholder:text-specter-muted"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="ghost" className="border border-specter text-specter-text hover:bg-specter-elevated">
            <Eye className="mr-1.5 h-4 w-4" />
            Preview Today's Briefing
          </Button>
          <Button variant="ghost" className="border border-specter text-specter-text hover:bg-specter-elevated">
            <Send className="mr-1.5 h-4 w-4" />
            Send Test Now
          </Button>
        </div>
      </div>

      <EmptyState
        icon={Bell}
        title="No briefings sent yet"
        description="Configure your briefing above. Past briefings will appear here with delivery status."
      />
    </div>
  );
}