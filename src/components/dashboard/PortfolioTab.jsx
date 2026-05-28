import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import EmptyState from './EmptyState';
import AddPositionDialog from './AddPositionDialog';
import ClosePositionDialog from './ClosePositionDialog';
import { useLivePrices } from '@/lib/useLivePrices';

const fmt = (n) =>
  n == null
    ? '—'
    : `${n >= 0 ? '+' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${n < 0 ? '' : ''}`.replace('+-', '-');

const fmtSigned = (n) => {
  if (n == null) return '—';
  const sign = n >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(n).toFixed(2)}`;
};

export default function PortfolioTab() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [closing, setClosing] = useState(null);

  const { data: positions = [], isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => base44.entities.Portfolio.list('-entry_date', 200),
  });

  const open = positions.filter((p) => p.status === 'open');
  const closed = positions.filter((p) => p.status === 'closed');

  const openTickers = useMemo(() => [...new Set(open.map((p) => p.ticker))], [open]);
  const { data: priceData } = useLivePrices(openTickers);
  const prices = priceData?.prices || {};

  // Unrealized P&L
  const unrealized = open.reduce((sum, p) => {
    const live = prices[p.ticker]?.price;
    if (live == null || p.entry_price == null) return sum;
    const dir = p.position_type === 'short' ? -1 : 1;
    return sum + dir * (live - p.entry_price) * p.quantity;
  }, 0);

  // Realized P&L (last 30d)
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const realized30d = closed
    .filter((p) => p.exit_date && new Date(p.exit_date).getTime() >= cutoff)
    .reduce((s, p) => s + (p.pnl || 0), 0);

  const stats = [
    { label: 'Open Positions', value: String(open.length) },
    {
      label: 'Unrealized P&L',
      value: fmtSigned(unrealized),
      mono: true,
      tone: unrealized >= 0 ? 'text-bull' : 'text-bear',
    },
    {
      label: 'Realized P&L (30d)',
      value: fmtSigned(realized30d),
      mono: true,
      tone: realized30d >= 0 ? 'text-bull' : 'text-bear',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portfolio</h2>
          <p className="mt-1 text-sm text-specter-muted">
            Track open and closed positions with live unrealized P&amp;L.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Position
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="specter-card p-5">
            <div className="agent-label text-specter-muted">{s.label}</div>
            <div className={`mt-2 text-2xl font-bold ${s.mono ? 'font-mono' : ''} ${s.tone || 'text-data'}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-lg bg-specter-surface" />
      ) : open.length === 0 && closed.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No positions yet"
          description="Log your trades to track P&L in real time. Specter pulls live prices and calculates unrealized gains automatically."
          action={
            <Button onClick={() => setAddOpen(true)} className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
              <Plus className="mr-1.5 h-4 w-4" />
              Log your first position
            </Button>
          }
        />
      ) : (
        <>
          {open.length > 0 && (
            <div className="specter-card overflow-hidden">
              <div className="border-b border-specter bg-specter-elevated/40 px-5 py-2.5">
                <span className="agent-label text-specter-text">Open Positions</span>
              </div>
              <div className="grid grid-cols-12 gap-3 border-b border-specter px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-wider text-specter-muted">
                <div className="col-span-2">Ticker</div>
                <div className="col-span-1">Side</div>
                <div className="col-span-2 text-right">Entry</div>
                <div className="col-span-2 text-right">Current</div>
                <div className="col-span-1 text-right">Qty</div>
                <div className="col-span-3 text-right">Unrealized P&L</div>
                <div className="col-span-1 text-right">—</div>
              </div>
              {open.map((p) => {
                const live = prices[p.ticker]?.price;
                const dir = p.position_type === 'short' ? -1 : 1;
                const pnl =
                  live != null && p.entry_price != null
                    ? dir * (live - p.entry_price) * p.quantity
                    : null;
                const pnlPct =
                  live != null && p.entry_price != null
                    ? dir * ((live - p.entry_price) / p.entry_price) * 100
                    : null;
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-12 items-center gap-3 border-b border-specter px-5 py-3 last:border-0"
                  >
                    <div className="col-span-2 font-mono text-sm font-semibold">{p.ticker}</div>
                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase ${
                          p.position_type === 'long'
                            ? 'border-bull/40 bg-bull/10 text-bull'
                            : 'border-bear/40 bg-bear/10 text-bear'
                        }`}
                      >
                        {p.position_type === 'long' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {p.position_type}
                      </span>
                    </div>
                    <div className="col-span-2 text-right font-mono text-sm text-data">
                      ${p.entry_price?.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-right font-mono text-sm text-data">
                      {live != null ? `$${live.toFixed(2)}` : <span className="text-specter-muted">—</span>}
                    </div>
                    <div className="col-span-1 text-right font-mono text-xs text-specter-text">
                      {p.quantity}
                    </div>
                    <div className="col-span-3 text-right font-mono text-sm">
                      {pnl != null ? (
                        <span className={pnl >= 0 ? 'text-bull' : 'text-bear'}>
                          {fmtSigned(pnl)}{' '}
                          <span className="text-[0.7rem] opacity-70">
                            ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-specter-muted">—</span>
                      )}
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => setClosing(p)}
                        className="rounded-md p-1.5 text-specter-muted hover:bg-specter-elevated hover:text-specter-text"
                        title="Close Position"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {closed.length > 0 && (
            <div className="specter-card overflow-hidden">
              <div className="border-b border-specter bg-specter-elevated/40 px-5 py-2.5">
                <span className="agent-label text-specter-text">Closed Positions</span>
              </div>
              <div className="grid grid-cols-12 gap-3 border-b border-specter px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-wider text-specter-muted">
                <div className="col-span-2">Ticker</div>
                <div className="col-span-1">Side</div>
                <div className="col-span-2 text-right">Entry</div>
                <div className="col-span-2 text-right">Exit</div>
                <div className="col-span-2 text-right">Closed</div>
                <div className="col-span-3 text-right">P&L</div>
              </div>
              {closed.slice(0, 20).map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 items-center gap-3 border-b border-specter px-5 py-3 last:border-0"
                >
                  <div className="col-span-2 font-mono text-sm font-semibold">{p.ticker}</div>
                  <div className="col-span-1 font-mono text-[0.65rem] uppercase text-specter-muted">{p.position_type}</div>
                  <div className="col-span-2 text-right font-mono text-sm text-data">
                    ${p.entry_price?.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-mono text-sm text-data">
                    ${p.exit_price?.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-mono text-xs text-specter-muted">
                    {p.exit_date}
                  </div>
                  <div className="col-span-3 text-right font-mono text-sm">
                    <span className={(p.pnl || 0) >= 0 ? 'text-bull' : 'text-bear'}>
                      {fmtSigned(p.pnl)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <AddPositionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={() => qc.invalidateQueries({ queryKey: ['portfolio'] })}
      />
      <ClosePositionDialog
        open={!!closing}
        position={closing}
        onOpenChange={(o) => !o && setClosing(null)}
        onClosed={() => qc.invalidateQueries({ queryKey: ['portfolio'] })}
      />
    </div>
  );
}