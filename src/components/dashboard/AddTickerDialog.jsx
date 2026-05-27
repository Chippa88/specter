import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

/**
 * AddTickerDialog — autocomplete search via Polygon, add to Watchlist on select.
 */
export default function AddTickerDialog({ open, onOpenChange, onAdded }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setError(null);
      setAdding(null);
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

  const handleAdd = async (item) => {
    setAdding(item.ticker);
    try {
      // Check if it already exists
      const existing = await base44.entities.Watchlist.filter({ ticker: item.ticker });
      if (existing.length > 0) {
        setError(`${item.ticker} is already on your watchlist.`);
        setAdding(null);
        return;
      }
      await base44.entities.Watchlist.create({
        ticker: item.ticker,
        name: item.name,
        asset_type: item.market === 'crypto' ? 'crypto' : (item.type === 'ETF' ? 'etf' : 'stock'),
      });
      onAdded?.();
      onOpenChange(false);
    } catch (e) {
      setError(e.message);
      setAdding(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-specter bg-specter-surface p-0 text-specter-text">
        <DialogTitle className="sr-only">Add Ticker to Watchlist</DialogTitle>
        <div className="border-b border-specter px-5 py-3">
          <div className="agent-label text-specter-muted">ADD TO WATCHLIST</div>
        </div>

        <div className="px-5 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-specter-muted" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              className="h-11 border-specter bg-specter-elevated pl-10 font-mono text-base text-specter-text placeholder:text-specter-muted focus-visible:ring-specter-primary"
              placeholder="Search ticker or company..."
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-specter-muted" />
            )}
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-bear/40 bg-bear/5 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bear" />
              <p className="text-xs text-specter-text">{error}</p>
            </div>
          )}

          <div className="mt-3 max-h-80 overflow-y-auto">
            {results.length === 0 && !loading && query && !error && (
              <p className="px-2 py-6 text-center text-xs text-specter-muted">No matches.</p>
            )}
            {!query && (
              <p className="px-2 py-6 text-center text-xs text-specter-muted">
                Start typing to search. Stocks, ETFs, and crypto supported.
              </p>
            )}
            <div className="space-y-1">
              {results.map((r) => (
                <button
                  key={r.ticker}
                  onClick={() => handleAdd(r)}
                  disabled={adding === r.ticker}
                  className="flex w-full items-center justify-between rounded-md border border-specter bg-specter-elevated/40 px-3 py-2.5 text-left transition-colors hover:border-specter-primary/40 hover:bg-specter-elevated disabled:opacity-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-specter-text">{r.ticker}</span>
                      {r.type && (
                        <span className="rounded border border-specter px-1.5 py-px font-mono text-[0.6rem] uppercase text-specter-muted">
                          {r.type}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-specter-muted">{r.name}</p>
                  </div>
                  {adding === r.ticker ? (
                    <Loader2 className="h-4 w-4 animate-spin text-specter-primary" />
                  ) : (
                    <span className="ml-3 font-mono text-[0.65rem] text-specter-primary">ADD →</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-specter px-5 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-specter-muted hover:text-specter-text">
            <X className="mr-1.5 h-3.5 w-3.5" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}