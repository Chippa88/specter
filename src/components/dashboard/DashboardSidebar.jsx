import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Settings } from 'lucide-react';
import { SpecterWordmark } from '@/components/brand/SpecterLogo';

/**
 * Fixed left sidebar — watchlist + mini portfolio P&L.
 * Stubbed data for Milestone 1 (skeleton).
 */
export default function DashboardSidebar() {
  // Skeleton stub — real data wires in Milestone 4
  const watchlist = [];
  const pnl = 0;

  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-specter bg-specter-bg lg:flex">
      <div className="flex h-16 items-center border-b border-specter px-5">
        <Link to="/"><SpecterWordmark /></Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="agent-label text-specter-muted">Watchlist</span>
          <span className="font-mono text-[0.7rem] text-specter-muted">{watchlist.length}</span>
        </div>

        {watchlist.length === 0 ? (
          <div className="mt-3 rounded-md border border-dashed border-specter px-4 py-6 text-center">
            <p className="text-xs text-specter-muted">
              Your watchlist is empty. Add a ticker to start tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {watchlist.map((w) => (
              <button
                key={w.ticker}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-specter-elevated"
              >
                <div className="min-w-0">
                  <div className="font-mono text-sm font-semibold text-specter-text">{w.ticker}</div>
                  <div className="truncate text-[0.7rem] text-specter-muted">{w.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-data text-xs">{w.price}</div>
                  <div className={`font-mono text-[0.7rem] ${w.up ? 'text-bull' : 'text-bear'}`}>
                    {w.chg}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <button className="mt-4 flex w-full items-center gap-2 rounded-md border border-dashed border-specter px-3 py-2 text-xs text-specter-muted hover:border-specter-primary/40 hover:text-specter-primary">
          <Plus className="h-3.5 w-3.5" />
          Add Ticker
        </button>
      </div>

      <div className="border-t border-specter p-5">
        <div className="agent-label mb-2 text-specter-muted">Portfolio P&amp;L</div>
        <div className={`font-mono text-2xl font-bold ${pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
        </div>
        <p className="mt-1 text-[0.7rem] text-specter-muted">unrealized · all open</p>

        <Link
          to="/settings"
          className="mt-5 flex items-center gap-2 text-xs text-specter-muted hover:text-specter-text"
        >
          <Settings className="h-3.5 w-3.5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}