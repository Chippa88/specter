import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useAnalysisRunner } from '@/lib/useAnalysisRunner';
import AgentProgressPanel from '@/components/analysis/AgentProgressPanel';
import { VERDICT_STYLES } from '@/components/agents/agentRegistry';

const CACHE_HOURS = 4;

export default function AnalysisTab() {
  const navigate = useNavigate();
  const [ticker, setTicker] = useState('');
  const [recent, setRecent] = useState([]);
  const [cachedMatch, setCachedMatch] = useState(null);
  const { start, run, isRunning, error, reset } = useAnalysisRunner();

  // Load recent analyses
  const loadRecent = async () => {
    try {
      const all = await base44.entities.Analysis.list('-created_date', 10);
      setRecent(all);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadRecent(); }, []);

  // Redirect to detail when complete
  useEffect(() => {
    if (run?.status === 'complete' && run.analysis_id) {
      // Refresh recent list, then navigate
      loadRecent().then(() => navigate(`/analysis/${run.analysis_id}`));
    }
  }, [run?.status, run?.analysis_id, navigate]);

  // Check for cache hit when user types
  useEffect(() => {
    const sym = ticker.toUpperCase().trim();
    if (!sym) { setCachedMatch(null); return; }
    const cached = recent.find((r) => {
      if (r.ticker !== sym) return false;
      const ageMs = Date.now() - new Date(r.created_date).getTime();
      return ageMs < CACHE_HOURS * 60 * 60 * 1000;
    });
    setCachedMatch(cached || null);
  }, [ticker, recent]);

  const handleRun = () => {
    const sym = ticker.trim();
    if (!sym) return;
    reset();
    start(sym);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Run Analysis</h2>
        <p className="mt-1 text-sm text-specter-muted">
          Enter a ticker. Specter deploys all 7 analysts and returns a structured briefing.
        </p>
      </div>

      {/* Search */}
      {!isRunning && (
        <div className="specter-card p-6">
          <label className="agent-label mb-3 block text-specter-muted">Ticker</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-specter-muted" />
              <Input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && !cachedMatch && handleRun()}
                className="h-12 border-specter bg-specter-elevated pl-10 font-mono text-base text-specter-text placeholder:text-specter-muted focus-visible:ring-specter-primary"
                placeholder="AAPL, NVDA, MES, NQ, GLD..."
              />
            </div>
            <Button
              onClick={handleRun}
              disabled={!ticker.trim() || !!cachedMatch}
              className="h-12 bg-specter-primary px-6 text-specter-bg hover:bg-specter-primary/90 disabled:opacity-50"
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              Run Specter Analysis
            </Button>
          </div>
          <p className="mt-3 font-mono text-[0.7rem] tracking-wider text-specter-muted">
            STOCKS · ETFS · FUTURES · CRYPTO
          </p>

          {/* Cache hit notice */}
          {cachedMatch && (
            <div className="mt-4 flex items-start gap-3 rounded-md border border-specter-primary/30 bg-specter-primary/5 p-4">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-specter-primary" />
              <div className="flex-1">
                <p className="text-sm text-specter-text">
                  You analyzed <span className="font-mono font-semibold">{cachedMatch.ticker}</span> recently.
                  Open the cached result or re-run.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/analysis/${cachedMatch.id}`)}
                    className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90"
                  >
                    Open Cached
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setCachedMatch(null); handleRun(); }}
                    className="border border-specter text-specter-text hover:bg-specter-elevated"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Re-run Analysis
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live progress while running */}
      {isRunning && run && <AgentProgressPanel run={run} />}

      {/* Error after run */}
      {error && !isRunning && (
        <div className="specter-card border-bear/40 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-bear" />
            <div className="flex-1">
              <h3 className="font-semibold text-specter-text">Analysis failed</h3>
              <p className="mt-1 text-sm text-specter-muted">{error}</p>
            </div>
            <Button variant="ghost" onClick={reset} className="text-specter-muted hover:text-specter-text">
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Recent analyses */}
      {!isRunning && (
        <div className="specter-card p-6">
          <div className="agent-label mb-4 text-specter-muted">Recent Analyses</div>
          {recent.length === 0 ? (
            <p className="text-sm text-specter-muted">
              No analyses yet. Your verdicts will appear here once you run your first ticker.
            </p>
          ) : (
            <div className="space-y-2">
              {recent.slice(0, 8).map((a) => {
                const style = VERDICT_STYLES[a.final_verdict] || VERDICT_STYLES.Hold;
                const hoursAgo = Math.round(
                  (Date.now() - new Date(a.created_date).getTime()) / (1000 * 60 * 60)
                );
                return (
                  <button
                    key={a.id}
                    onClick={() => navigate(`/analysis/${a.id}`)}
                    className="flex w-full items-center gap-4 rounded-md border border-specter bg-specter-elevated/40 px-4 py-3 text-left transition-colors hover:border-specter-primary/40 hover:bg-specter-elevated"
                  >
                    <span className="font-mono text-sm font-semibold text-specter-text">
                      {a.ticker}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${style.bg} ${style.border} ${style.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {a.final_verdict}
                    </span>
                    <span className="font-mono text-[0.7rem] text-specter-muted">
                      conf {a.confidence_score}
                    </span>
                    <span className="ml-auto font-mono text-[0.7rem] text-specter-muted">
                      {hoursAgo === 0 ? 'just now' : `${hoursAgo}h ago`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="rounded-md border border-specter bg-specter-surface/40 px-4 py-3">
        <p className="text-[0.72rem] leading-relaxed text-specter-muted">
          <span className="font-semibold text-specter-text/80">Disclaimer.</span> For informational
          purposes only. Not financial advice. Specter does not guarantee accuracy. All investments
          carry risk.
        </p>
      </div>
    </div>
  );
}