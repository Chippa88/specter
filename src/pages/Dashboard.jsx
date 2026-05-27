import React, { useState } from 'react';
import { Sparkles, Eye, Wallet, Globe2, Bell } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import MacroBanner from '@/components/dashboard/MacroBanner';
import AnalysisTab from '@/components/dashboard/AnalysisTab';
import WatchlistTab from '@/components/dashboard/WatchlistTab';
import PortfolioTab from '@/components/dashboard/PortfolioTab';
import MacroTab from '@/components/dashboard/MacroTab';
import BriefingsTab from '@/components/dashboard/BriefingsTab';

const TABS = [
  { id: 'analysis', label: 'Analysis', icon: Sparkles },
  { id: 'watchlist', label: 'Watchlist', icon: Eye },
  { id: 'portfolio', label: 'Portfolio', icon: Wallet },
  { id: 'macro', label: 'Macro', icon: Globe2 },
  { id: 'briefings', label: 'Briefings', icon: Bell },
];

export default function Dashboard() {
  const [tab, setTab] = useState('analysis');

  return (
    <div className="flex min-h-screen bg-specter-bg text-specter-text">
      <DashboardSidebar />

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
                  active
                    ? 'text-specter-text'
                    : 'text-specter-muted hover:text-specter-text'
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
            <div className="hidden items-center gap-2 rounded-full border border-specter bg-specter-surface px-3 py-1 sm:flex">
              <span className="font-mono text-[0.7rem] text-specter-muted">USAGE</span>
              <span className="font-mono text-xs text-data">0 / 5</span>
            </div>
          </div>
        </div>

        <MacroBanner />

        <div className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-6xl">
            {tab === 'analysis' && <AnalysisTab />}
            {tab === 'watchlist' && <WatchlistTab />}
            {tab === 'portfolio' && <PortfolioTab />}
            {tab === 'macro' && <MacroTab />}
            {tab === 'briefings' && <BriefingsTab />}
          </div>
        </div>
      </main>
    </div>
  );
}