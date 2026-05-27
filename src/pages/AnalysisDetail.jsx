import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { SpecterWordmark } from '@/components/brand/SpecterLogo';
import VerdictPanel from '@/components/analysis/VerdictPanel';
import RiskPanel from '@/components/analysis/RiskPanel';
import AgentReportCard from '@/components/analysis/AgentReportCard';
import BullBearCards from '@/components/analysis/BullBearCards';
import { AGENTS } from '@/components/agents/agentRegistry';

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await base44.entities.Analysis.list();
        const found = all.find((a) => a.id === id);
        if (cancelled) return;
        if (!found) setError('Analysis not found');
        else setAnalysis(found);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-specter-bg">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="h-6 w-48 animate-pulse rounded bg-specter-elevated" />
          <div className="mt-6 h-48 animate-pulse rounded-lg bg-specter-surface" />
          <div className="mt-4 h-32 animate-pulse rounded-lg bg-specter-surface" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-specter-bg p-6 text-center">
        <AlertCircle className="h-10 w-10 text-bear" />
        <h2 className="mt-4 text-xl font-semibold text-specter-text">Analysis not found</h2>
        <p className="mt-2 text-sm text-specter-muted">{error || 'This analysis may have been deleted.'}</p>
        <Link to="/dashboard" className="mt-6">
          <Button className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Extract company name + price from data_sources
  let extra = {};
  try { extra = (JSON.parse(analysis.data_sources || '{}').risk_extra) || {}; } catch {}

  // Time-ago
  const hoursAgo = analysis.created_date
    ? Math.round((Date.now() - new Date(analysis.created_date).getTime()) / (1000 * 60 * 60))
    : 0;

  const fundamentalsAgent = AGENTS.find((a) => a.id === 'fundamentals');
  const technicalAgent = AGENTS.find((a) => a.id === 'technical');
  const sentimentAgent = AGENTS.find((a) => a.id === 'sentiment');
  const newsAgent = AGENTS.find((a) => a.id === 'news');
  const riskAgent = AGENTS.find((a) => a.id === 'risk');

  return (
    <div className="min-h-screen bg-specter-bg text-specter-text">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-specter bg-specter-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-5">
            <Link to="/dashboard" className="flex items-center gap-2 text-sm text-specter-muted hover:text-specter-text">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <span className="h-4 w-px bg-specter-border" />
            <SpecterWordmark />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="font-mono text-4xl font-bold text-specter-text">{analysis.ticker}</h1>
              {extra.company_name && (
                <span className="text-sm text-specter-muted">{extra.company_name}</span>
              )}
            </div>
            {extra.current_price != null && (
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-data text-2xl">${extra.current_price.toFixed(2)}</span>
                {extra.change_pct != null && (
                  <span className={`font-mono text-sm ${extra.change_pct >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {extra.change_pct >= 0 ? '+' : ''}{extra.change_pct.toFixed(2)}%
                  </span>
                )}
              </div>
            )}
            <p className="mt-2 font-mono text-[0.7rem] tracking-wider text-specter-muted">
              ANALYZED {hoursAgo === 0 ? 'JUST NOW' : `${hoursAgo} ${hoursAgo === 1 ? 'HOUR' : 'HOURS'} AGO`}
            </p>
          </div>

          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Run New Analysis
          </Button>
        </div>

        {/* Verdict + Risk side by side */}
        <div className="grid gap-5 lg:grid-cols-2">
          <VerdictPanel analysis={analysis} />
          <RiskPanel analysis={analysis} />
        </div>

        {/* Analyst reports */}
        <div className="space-y-3">
          <AgentReportCard agent={fundamentalsAgent} report={analysis.fundamentals_report} defaultOpen />
          <AgentReportCard agent={technicalAgent} report={analysis.technical_report} />
          <AgentReportCard agent={sentimentAgent} report={analysis.sentiment_report} />
          <AgentReportCard agent={newsAgent} report={analysis.news_report} />
        </div>

        {/* Bull / Bear side by side */}
        <BullBearCards bullCase={analysis.bull_case} bearCase={analysis.bear_case} />

        {/* Risk Manager full-width */}
        <AgentReportCard
          agent={riskAgent}
          report={`## Final Verdict\n\n**${analysis.final_verdict}** with confidence ${analysis.confidence_score}/100.\n\n${analysis.verdict_reasoning || ''}\n\n## Risk Score\n\n${analysis.risk_score}/10 — ${extra.volatility_label || ''} volatility, ${extra.liquidity_label || ''} liquidity, ${extra.news_risk_label || ''} news risk.\n\n## Position Sizing\n\nSuggested max position: **${extra.max_position_pct || '—'}%** of portfolio.`}
          defaultOpen
        />

        {/* Disclaimer */}
        <div className="rounded-md border border-specter bg-specter-surface/40 px-4 py-3">
          <p className="text-[0.72rem] leading-relaxed text-specter-muted">
            <span className="font-semibold text-specter-text/80">Disclaimer.</span> For informational
            purposes only. Not financial advice. Specter does not guarantee accuracy. All
            investments carry risk.
          </p>
        </div>
      </div>
    </div>
  );
}