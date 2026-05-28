import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Sparkles, Check } from 'lucide-react';
import SpecterLogo, { SpecterWordmark } from '@/components/brand/SpecterLogo';
import TickerTape from '@/components/brand/TickerTape';
import AgentCard from '@/components/agents/AgentCard';
import Footer from '@/components/brand/Footer';
import { AGENTS } from '@/components/agents/agentRegistry';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-specter-bg text-specter-text">
      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-specter bg-specter-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/"><SpecterWordmark /></Link>
          <div className="flex items-center gap-3">
            <Link to="/pricing" className="hidden text-sm text-specter-muted hover:text-specter-text sm:block">
              Pricing
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" className="text-sm text-specter-muted hover:bg-specter-elevated hover:text-specter-text">
                Sign in
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <TickerTape />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 specter-grid-bg opacity-30" />
        <div className="absolute inset-0 specter-spotlight" />
        {/* Faint ghost watermark behind hero */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]">
          <SpecterLogo size={520} className="text-specter-primary" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-28 pt-24 text-center md:pt-32">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-specter bg-specter-surface/60 px-3 py-1 text-xs text-specter-muted backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-specter-primary" />
            <span className="font-mono tracking-wider">SPECTER · INTELLIGENCE TERMINAL</span>
          </div>

          <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            The market has a{' '}
            <span className="relative inline-block">
              <span className="text-specter-primary">Specter</span>
              <span className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-transparent via-specter-primary to-transparent" />
            </span>
            <span className="text-specter-text">.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-specter-muted md:text-xl">
            7 AI analysts watch every ticker. One verdict. Total vision.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/dashboard">
              <Button size="lg" className="group h-12 bg-specter-primary px-6 text-specter-bg hover:bg-specter-primary/90">
                Start Free
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <a href="#demo">
              <Button size="lg" variant="ghost" className="h-12 border border-specter px-6 text-specter-text hover:bg-specter-elevated">
                <Eye className="mr-1.5 h-4 w-4" />
                See a Live Demo
              </Button>
            </a>
          </div>

          <p className="mt-6 font-mono text-[0.72rem] tracking-wider text-specter-muted">
            5 ANALYSES FREE · NO CREDIT CARD · BRING YOUR OWN OPENAI KEY
          </p>
        </div>
      </section>

      {/* THE 7 AGENTS */}
      <section className="relative border-t border-specter py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <div className="agent-label mb-3 text-specter-primary">SEVEN MINDS</div>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">One market view.</h2>
            <p className="mx-auto mt-4 max-w-xl text-specter-muted">
              Specter deploys seven specialized analyst agents. Each pulls live data, builds its
              case, and submits to the Risk Manager for a final verdict.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
            {/* 7th — full width on lg */}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative border-t border-specter bg-specter-surface/40 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <div className="agent-label mb-3 text-specter-primary">HOW IT WORKS</div>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Three steps to vision.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { n: '01', t: 'Pick any ticker', d: 'Stocks, ETFs, futures, crypto. Type a symbol.' },
              { n: '02', t: 'Specter deploys all 7 analysts', d: 'Fundamentals, technicals, sentiment, news, bull, bear, risk.' },
              { n: '03', t: 'Receive your verdict', d: 'Structured briefing with confidence score and risk assessment.' },
            ].map((s) => (
              <div key={s.n} className="specter-card p-7">
                <div className="font-mono text-sm text-specter-primary">{s.n}</div>
                <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-specter-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO PREVIEW */}
      <section id="demo" className="relative border-t border-specter py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <div className="agent-label mb-3 text-specter-primary">LIVE EXAMPLE</div>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">This is what Specter sees.</h2>
            <p className="mx-auto mt-4 max-w-xl text-specter-muted">
              A real briefing rendered exactly as it appears in your terminal.
            </p>
          </div>

          {/* Mock terminal frame */}
          <div className="specter-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-specter bg-specter-elevated/40 px-5 py-3">
              <div className="flex items-center gap-2 font-mono text-xs text-specter-muted">
                <span className="h-2 w-2 rounded-full bg-specter-bear/60" />
                <span className="h-2 w-2 rounded-full bg-specter-caution/60" />
                <span className="h-2 w-2 rounded-full bg-specter-bull/60" />
                <span className="ml-3">specter / analysis / AAPL</span>
              </div>
              <span className="font-mono text-xs text-specter-muted">SAMPLE</span>
            </div>

            <div className="grid gap-6 p-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="flex items-baseline gap-3">
                  <h3 className="font-mono text-3xl font-bold text-specter-text">AAPL</h3>
                  <span className="text-sm text-specter-muted">Apple Inc.</span>
                </div>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-data text-2xl">$189.42</span>
                  <span className="font-mono text-sm text-bull">+1.2%</span>
                </div>

                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[hsl(145_100%_45%/0.4)] bg-[hsl(145_100%_45%/0.15)] px-4 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-bull" />
                  <span className="font-semibold text-bull">Buy</span>
                  <span className="text-xs text-specter-muted">· 78 confidence</span>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between font-mono text-xs">
                    <span className="text-bull">BULL 73%</span>
                    <span className="text-bear">27% BEAR</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-specter-elevated">
                    <div className="bg-bull" style={{ width: '73%' }} />
                    <div className="bg-bear" style={{ width: '27%' }} />
                  </div>
                </div>

                <p className="mt-6 text-sm leading-relaxed text-specter-muted">
                  Services revenue accelerating into double-digits while iPhone cycle stabilizes.
                  Technical setup constructive above $185 support. Macro headwinds present but
                  digestible at current valuation.
                </p>
              </div>

              <div className="space-y-3">
                {AGENTS.slice(0, 4).map((a) => {
                  const Icon = a.icon;
                  return (
                    <div key={a.id} className="flex items-center gap-3 rounded-md border border-specter bg-specter-elevated/40 p-3">
                      <Icon className={`h-4 w-4 ${a.colorClass}`} strokeWidth={1.75} />
                      <span className="agent-label text-specter-text">{a.name.split(' ')[0]}</span>
                      <Check className="ml-auto h-4 w-4 text-bull" />
                    </div>
                  );
                })}
                <div className="rounded-md border border-[hsl(41_100%_50%/0.3)] bg-[hsl(41_100%_50%/0.05)] p-3 text-center">
                  <div className="font-mono text-2xl font-bold text-caution">4</div>
                  <div className="agent-label text-specter-muted">RISK SCORE</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/dashboard">
              <Button size="lg" className="h-12 bg-specter-primary px-6 text-specter-bg hover:bg-specter-primary/90">
                <Sparkles className="mr-1.5 h-4 w-4" />
                Run your first analysis free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="border-t border-specter bg-specter-surface/40 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Institutional research. Retail pricing.
          </h2>
          <p className="mt-4 text-specter-muted">
            From $29/mo. Bring your own OpenAI key. Cancel anytime.
          </p>
          <Link to="/pricing">
            <Button size="lg" variant="ghost" className="mt-8 h-12 border border-specter px-6 text-specter-text hover:bg-specter-elevated">
              See plans
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}