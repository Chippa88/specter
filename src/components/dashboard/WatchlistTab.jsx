import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Plus, Sparkles, Trash2, Bell, BellOff, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import EmptyState from './EmptyState';
import AddTickerDialog from './AddTickerDialog';
import { useLivePrices } from '@/lib/useLivePrices';
import { useAnalysisRunner } from '@/lib/useAnalysisRunner';
import AgentProgressPanel from '@/components/analysis/AgentProgressPanel';
import { VERDICT_STYLES } from '@/components/agents/agentRegistry';

export default function WatchlistTab() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const { start, run, isRunning, error: runError, reset } = useAnalysisRunner();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => base44.entities.Watchlist.list('-created_date', 100),
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ['analyses-recent'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 100),
  });

  const tickers = items.map((i) => i.ticker);
  const { data: priceData } = useLivePrices(tickers);
  const prices = priceData?.prices || {};

  // Latest verdict per ticker
  const latestVerdict = {};
  for (const a of analyses) {
    if (!latestVerdict[a.ticker]) latestVerdict[a.ticker] = a;
  }

  // Redirect to detail when complete
  useEffect(() => {
    if (run?.status === 'complete' && run.analysis_id) {
      qc.invalidateQueries({ queryKey: ['analyses-recent'] });
      navigate(`/analysis/${run.analysis_id}`);
    }
  }, [run?.status, run?.analysis_id, navigate, qc]);

  const handleRemove = async (item) => {
    await base44.entities.Watchlist.delete(item.id);
    qc.invalidateQueries({ queryKey: ['watchlist'] });
  };

  const toggleAlert = async (item) => {
    await base44.entities.Watchlist.update(item.id, { alert_enabled: !item.alert_enabled });
    qc.invalidateQueries({ queryKey: ['watchlist'] });
  };

  if (isRunning && run) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Watchlist</h2>
          <p className="mt-1 text-sm text-specter-muted">Running analysis from watchlist…</p>
        </div>
        <AgentProgressPanel run={run} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Watchlist</h2>
          <p className="mt-1 text-sm text-specter-muted">
            Track tickers with last-known verdicts and live prices.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Ticker
        </Button>
      </div>

      {runError && (
        <div className="specter-card border-bear/40 p-4">
          <p className="text-sm text-specter-text">{runError}</p>
          <Button size="sm" variant="ghost" onClick={reset} className="mt-2 text-specter-muted">Dismiss</Button>
        </div>
      )}

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-lg bg-specter-surface" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="No tickers on your watchlist"
          description="Add tickers you want Specter to keep an eye on. Live prices refresh every 90 seconds."
          action={
            <Button onClick={() => setAddOpen(true)} className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
              <Plus className="mr-1.5 h-4 w-4" />
              Add your first ticker
            </Button>
          }
        />
      ) : (
        <div className="specter-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 border-b border-specter px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-wider text-specter-muted">
            <div className="col-span-3">Ticker</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Change</div>
            <div className="col-span-3">Latest Verdict</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {items.map((item) => {
            const p = prices[item.ticker] || {};
            const v = latestVerdict[item.ticker];
            const style = v ? VERDICT_STYLES[v.final_verdict] : null;
            const hoursAgo = v
              ? Math.round((Date.now() - new Date(v.created_date).getTime()) / (1000 * 60 * 60))
              : null;
            const stale = hoursAgo != null && hoursAgo >= 24;

            return (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center gap-3 border-b border-specter px-5 py-3 transition-colors last:border-0 hover:bg-specter-elevated/40"
              >
                <div className="col-span-3 min-w-0">
                  <div className="font-mono text-sm font-semibold text-specter-text">{item.ticker}</div>
                  <div className="truncate text-[0.7rem] text-specter-muted">{item.name || '—'}</div>
                </div>
                <div className="col-span-2 text-right font-mono text-sm text-data">
                  {p.price != null ? `$${p.price.toFixed(2)}` : <span className="text-specter-muted">—</span>}
                </div>
                <div className="col-span-2 text-right font-mono text-xs">
                  {p.change_pct != null ? (
                    <span className={p.change_pct >= 0 ? 'text-bull' : 'text-bear'}>
                      {p.change_pct >= 0 ? '+' : ''}{p.change_pct.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-specter-muted">—</span>
                  )}
                </div>
                <div className="col-span-3">
                  {v && style ? (
                    <button
                      onClick={() => navigate(`/analysis/${v.id}`)}
                      className={`group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${style.bg} ${style.border} ${style.text} ${stale ? 'opacity-50' : ''}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {v.final_verdict}
                      <span className="font-mono text-[0.65rem] opacity-70">{hoursAgo}h</span>
                      <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-70" />
                    </button>
                  ) : (
                    <span className="text-xs text-specter-muted">No verdict yet</span>
                  )}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    onClick={() => { reset(); start(item.ticker); }}
                    className="rounded-md p-1.5 text-specter-muted hover:bg-specter-primary/10 hover:text-specter-primary"
                    title="Run Analysis"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleAlert(item)}
                    className={`rounded-md p-1.5 hover:bg-specter-elevated ${
                      item.alert_enabled ? 'text-specter-primary' : 'text-specter-muted hover:text-specter-text'
                    }`}
                    title={item.alert_enabled ? 'Alerts on' : 'Alerts off'}
                  >
                    {item.alert_enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleRemove(item)}
                    className="rounded-md p-1.5 text-specter-muted hover:bg-bear/10 hover:text-bear"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddTickerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={() => qc.invalidateQueries({ queryKey: ['watchlist'] })}
      />
    </div>
  );
}