import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Settings, Command } from 'lucide-react';
import { SpecterWordmark } from '@/components/brand/SpecterLogo';
import { base44 } from '@/api/base44Client';
import { useLivePrices } from '@/lib/useLivePrices';

/**
 * Left sidebar — live watchlist + portfolio P&L.
 */
export default function DashboardSidebar({ onOpenSearch, onOpenAddTicker }) {
  const navigate = useNavigate();

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => base44.entities.Watchlist.list('-created_date', 100),
  });

  const { data: positions = [] } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => base44.entities.Portfolio.list('-entry_date', 200),
  });

  const watchTickers = watchlist.map((w) => w.ticker);
  const openPositions = positions.filter((p) => p.status === 'open');
  const allTickers = [...new Set([...watchTickers, ...openPositions.map((p) => p.ticker)])];
  const { data: priceData } = useLivePrices(allTickers);
  const prices = priceData?.prices || {};

  const unrealized = openPositions.reduce((sum, p) => {
    const live = prices[p.ticker]?.price;
    if (live == null || p.entry_price == null) return sum;
    const dir = p.position_type === 'short' ? -1 : 1;
    return sum + dir * (live - p.entry_price) * p.quantity;
  }, 0);

  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-specter bg-specter-bg lg:flex">
      <div className="flex h-16 items-center border-b border-specter px-5">
        <Link to="/"><SpecterWordmark /></Link>
      </div>

      {/* Quick command */}
      {onOpenSearch && (
        <div className="border-b border-specter px-3 py-3">
          <button
            onClick={onOpenSearch}
            className="flex w-full items-center gap-2 rounded-md border border-specter bg-specter-elevated/50 px-3 py-2 text-left text-xs text-specter-muted hover:border-specter-primary/40 hover:text-specter-text"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="flex-1">Search ticker...</span>
            <kbd className="rounded border border-specter bg-specter-bg px-1.5 py-0.5 font-mono text-[0.6rem]">⌘K</kbd>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-4">
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
          <div className="space-y-0.5">
            {watchlist.slice(0, 12).map((w) => {
              const p = prices[w.ticker] || {};
              return (
                <button
                  key={w.id}
                  onClick={() => navigate('/dashboard')}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-specter-elevated"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-semibold text-specter-text">{w.ticker}</div>
                    <div className="truncate text-[0.7rem] text-specter-muted">{w.name || w.asset_type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-data text-xs">
                      {p.price != null ? `$${p.price.toFixed(2)}` : '—'}
                    </div>
                    <div
                      className={`font-mono text-[0.7rem] ${
                        p.change_pct == null
                          ? 'text-specter-muted'
                          : p.change_pct >= 0
                          ? 'text-bull'
                          : 'text-bear'
                      }`}
                    >
                      {p.change_pct != null
                        ? `${p.change_pct >= 0 ? '+' : ''}${p.change_pct.toFixed(2)}%`
                        : '—'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={onOpenAddTicker}
          className="mt-4 flex w-full items-center gap-2 rounded-md border border-dashed border-specter px-3 py-2 text-xs text-specter-muted hover:border-specter-primary/40 hover:text-specter-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Ticker
        </button>
      </div>

      <div className="border-t border-specter p-5">
        <div className="agent-label mb-2 text-specter-muted">Portfolio P&amp;L</div>
        <div className={`font-mono text-2xl font-bold ${unrealized >= 0 ? 'text-bull' : 'text-bear'}`}>
          {unrealized >= 0 ? '+' : '-'}${Math.abs(unrealized).toFixed(2)}
        </div>
        <p className="mt-1 text-[0.7rem] text-specter-muted">
          unrealized · {openPositions.length} open
        </p>

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