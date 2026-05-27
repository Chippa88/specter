import React from 'react';
import { Wallet, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from './EmptyState';

export default function PortfolioTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portfolio</h2>
          <p className="mt-1 text-sm text-specter-muted">
            Track open and closed positions with live unrealized P&amp;L.
          </p>
        </div>
        <Button className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Position
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Open Positions', value: '0' },
          { label: 'Unrealized P&L', value: '$0.00', mono: true },
          { label: 'Realized P&L (30d)', value: '$0.00', mono: true },
        ].map((s) => (
          <div key={s.label} className="specter-card p-5">
            <div className="agent-label text-specter-muted">{s.label}</div>
            <div className={`mt-2 text-2xl font-bold ${s.mono ? 'font-mono text-data' : ''}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <EmptyState
        icon={Wallet}
        title="No open positions"
        description="Log your trades to track P&L in real time. Specter pulls live prices and calculates unrealized gains automatically."
      />
    </div>
  );
}