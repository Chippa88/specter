import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Sparkles, Eye, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

/**
 * Global ⌘K command palette — search any ticker, run analysis or open last verdict.
 */
export default function CommandPalette({ open, onOpenChange, onRunAnalysis }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setError(null);
      // Preload recent analyses
      base44.entities.Analysis.list('-created_date', 10).then(setRecentAnalyses).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await base44.functions.invoke('fetchTickerSearch', { query });
        if (res.data?.error === 'missing_key') {
          setError('Polygon API key missing — add it in Settings.');
        } else {
          setResults(res.data?.results || []);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleRun = (ticker) => {
    onOpenChange(false);
    onRunAnalysis?.(ticker);
  };

  const handleOpenAnalysis = (id) => {
    onOpenChange(false);
    navigate(`/analysis/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-specter bg-specter-surface p-0 text-specter-text">
        <DialogTitle className="sr-only">Search & Run Analysis</DialogTitle>
        <div className="relative border-b border-specter">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-specter-muted" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            className="h-14 rounded-none border-0 bg-transparent pl-11 font-mono text-base text-specter-text placeholder:text-specter-muted focus-visible:ring-0"
            placeholder="Search ticker or company..."
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-specter-muted" />
          )}
        </div>

        <div className="max-h-96 overflow-y-auto px-2 py-2">
          {error && (
            <div className="m-2 flex items-start gap-2 rounded-md border border-bear/40 bg-bear/5 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bear" />
              <p className="text-xs text-specter-text">{error}</p>
            </div>
          )}

          {/* Search results */}
          {results.length > 0 && (
            <div className="mb-2">
              <div className="agent-label px-3 pb-1.5 pt-2 text-specter-muted">SEARCH RESULTS</div>
              {results.map((r) => (
                <button
                  key={r.ticker}
                  onClick={() => handleRun(r.ticker)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-specter-elevated"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-specter-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-specter-text">{r.ticker}</span>
                      {r.type && (
                        <span className="rounded border border-specter px-1.5 py-px font-mono text-[0.6rem] uppercase text-specter-muted">
                          {r.type}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-specter-muted">{r.name}</p>
                  </div>
                  <span className="font-mono text-[0.65rem] text-specter-primary">RUN →</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent analyses */}
          {!query && recentAnalyses.length > 0 && (
            <div>
              <div className="agent-label px-3 pb-1.5 pt-2 text-specter-muted">RECENT ANALYSES</div>
              {recentAnalyses.slice(0, 6).map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleOpenAnalysis(a.id)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-specter-elevated"
                >
                  <Eye className="h-4 w-4 shrink-0 text-specter-muted" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-specter-text">{a.ticker}</span>
                      <span className="text-xs text-specter-muted">{a.final_verdict}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[0.65rem] text-specter-muted">OPEN →</span>
                </button>
              ))}
            </div>
          )}

          {!query && results.length === 0 && recentAnalyses.length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-specter-muted">
              Start typing to search any ticker.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-specter px-4 py-2 text-[0.7rem] text-specter-muted">
          <span>
            <kbd className="rounded border border-specter bg-specter-bg px-1.5 py-0.5 font-mono text-[0.65rem]">↵</kbd> run analysis
          </span>
          <span>
            <kbd className="rounded border border-specter bg-specter-bg px-1.5 py-0.5 font-mono text-[0.65rem]">esc</kbd> close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}