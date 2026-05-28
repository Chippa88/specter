import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, Wallet, Globe2, Bell, Command } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import MacroBanner from '@/components/dashboard/MacroBanner';
import AnalysisTab from '@/components/dashboard/AnalysisTab';
import WatchlistTab from '@/components/dashboard/WatchlistTab';
import PortfolioTab from '@/components/dashboard/PortfolioTab';
import MacroTab from '@/components/dashboard/MacroTab';
import BriefingsTab from '@/components/dashboard/BriefingsTab';
import CommandPalette from '@/components/dashboard/CommandPalette';
import AddTickerDialog from '@/components/dashboard/AddTickerDialog';
import AgentProgressPanel from '@/components/analysis/AgentProgressPanel';
import { useAnalysisRunner } from '@/lib/useAnalysisRunner';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const TABS = [
  { id: 'analysis', label: 'Analysis', icon: Sparkles },
  { id: 'watchlist', label: 'Watchlist', icon: Eye },
  { id: 'portfolio', label: 'Portfolio', icon: Wallet },
  { id: 'macro', label: 'Macro', icon: Globe2 },
  { id: 'briefings', label: 'Briefings', icon: Bell },
];

export default function Dashboard() {
  const [tab, setTab] = useState('analysis');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [addTickerOpen, setAddTickerOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { start, run, isRunning, reset } = useAnalysisRunner();

  // ⌘K / Ctrl+K — open command palette
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Redirect when palette-triggered run completes
  useEffect(() => {
    if (run?.status === 'complete' && run.analysis_id) {
      qc.invalidateQueries({ queryKey: ['analyses-recent'] });
      navigate(`/analysis/${run.analysis_id}`);
    }
  }, [run?.status, run?.analysis_id, navigate, qc]);

  const handleRunFromPalette = (ticker) => {
    reset();
    start(ticker);
  };

  return (
    <div className="flex min-h-screen bg-specter-bg text-specter-text">
      <DashboardSidebar
        onOpenSearch={() => setPaletteOpen(true)}
        onOpenAddTicker={() => setAddTickerOpen(true)}
      />

      <main className="flex min-h-screen flex-1 flex-col">
        {/* Top tab nav */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-1 border-b border-specter bg-specter-bg/80 px-6 backdrop-blur-md">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`group relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'text-specter-text' : 'text-specter-muted hover:text-specter-text'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-specter-primary' : ''}`} strokeWidth={1.75} />
                {t.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-px bg-specter-primary" />
                )}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-md border border-specter bg-specter-surface px-3 py-1.5 text-xs text-specter-muted hover:border-specter-primary/40 hover:text-specter-text sm:flex"
            >
              <Command className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="rounded border border-specter bg-specter-bg px-1.5 py-0.5 font-mono text-[0.6rem]">⌘K</kbd>
            </button>
          </div>
        </div>

        <MacroBanner />

        <div className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-6xl">
            {/* Global running banner (when triggered from palette/sidebar) */}
            {isRunning && run && tab !== 'watchlist' && tab !== 'analysis' && (
              <div className="mb-6">
                <AgentProgressPanel run={run} />
              </div>
            )}

            {tab === 'analysis' && <AnalysisTab />}
            {tab === 'watchlist' && <WatchlistTab />}
            {tab === 'portfolio' && <PortfolioTab />}
            {tab === 'macro' && <MacroTab />}
            {tab === 'briefings' && <BriefingsTab />}
          </div>
        </div>
      </main>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onRunAnalysis={handleRunFromPalette}
      />

      <AddTickerDialog
        open={addTickerOpen}
        onOpenChange={setAddTickerOpen}
        onAdded={() => qc.invalidateQueries({ queryKey: ['watchlist'] })}
      />
    </div>
  );
}