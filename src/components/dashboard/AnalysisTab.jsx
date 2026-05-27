import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Analysis tab — search + run button.
 * Milestone 3 wires runAgentAnalysis with live agent progress panel.
 */
export default function AnalysisTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Run Analysis</h2>
        <p className="mt-1 text-sm text-specter-muted">
          Enter a ticker. Specter deploys all 7 analysts and returns a structured briefing.
        </p>
      </div>

      <div className="specter-card p-6">
        <label className="agent-label mb-3 block text-specter-muted">Ticker</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-specter-muted" />
            <Input
              className="h-12 border-specter bg-specter-elevated pl-10 font-mono text-base text-specter-text placeholder:text-specter-muted focus-visible:ring-specter-primary"
              placeholder="AAPL, NVDA, MES, NQ, GLD..."
            />
          </div>
          <Button
            disabled
            className="h-12 bg-specter-primary px-6 text-specter-bg hover:bg-specter-primary/90"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Run Specter Analysis
          </Button>
        </div>
        <p className="mt-3 font-mono text-[0.7rem] tracking-wider text-specter-muted">
          AUTOCOMPLETE · STOCKS · ETFS · FUTURES · CRYPTO
        </p>
      </div>

      <div className="specter-card p-6">
        <div className="agent-label mb-4 text-specter-muted">Recent Analyses</div>
        <p className="text-sm text-specter-muted">
          No analyses yet. Your verdicts will appear here once you run your first ticker.
        </p>
      </div>

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