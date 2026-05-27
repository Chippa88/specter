import React from 'react';
import { Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from './EmptyState';

export default function WatchlistTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Watchlist</h2>
          <p className="mt-1 text-sm text-specter-muted">
            Track tickers with last-known verdicts and confidence decay.
          </p>
        </div>
        <Button className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Ticker
        </Button>
      </div>

      <EmptyState
        icon={Eye}
        title="No tickers on your watchlist"
        description="Add tickers you want Specter to keep an eye on. Verdicts dim after 24 hours and turn stale after 72."
        action={
          <Button className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
            <Plus className="mr-1.5 h-4 w-4" />
            Add your first ticker
          </Button>
        }
      />
    </div>
  );
}