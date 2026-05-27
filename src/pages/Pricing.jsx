import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SpecterWordmark } from '@/components/brand/SpecterLogo';
import Footer from '@/components/brand/Footer';

const TIERS = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    desc: 'Test the terminal',
    features: [
      '5 analyses / month',
      '4 basic agents (no Bull / Bear / Risk)',
      'No daily briefings',
      'No broker sync',
    ],
    cta: 'Start Free',
  },
  {
    name: 'Starter',
    monthly: 29,
    annual: 23,
    desc: 'For active retail traders',
    features: [
      '50 analyses / month',
      'All 7 Specter agents',
      'Daily Telegram briefings',
      'Watchlist + Portfolio tracker',
    ],
    cta: 'Get Starter',
  },
  {
    name: 'Pro',
    monthly: 59,
    annual: 47,
    desc: 'For serious operators',
    features: [
      '200 analyses / month',
      'All 7 Specter agents',
      'Daily briefings + threshold alerts',
      'Alpaca paper trading sync',
      'PDF export',
    ],
    cta: 'Get Pro',
    popular: true,
  },
  {
    name: 'Elite',
    monthly: 99,
    annual: 79,
    desc: 'For full-time desks',
    features: [
      'Unlimited analyses',
      'All 7 Specter agents',
      'Any briefing frequency',
      'Full broker sync',
      'Priority processing',
      'Custom agent instructions',
    ],
    cta: 'Go Elite',
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-specter-bg text-specter-text">
      <nav className="sticky top-0 z-40 border-b border-specter bg-specter-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/"><SpecterWordmark /></Link>
          <Link to="/dashboard">
            <Button className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
              Start Free
            </Button>
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-20">
        <div className="text-center">
          <div className="agent-label mb-3 text-specter-primary">PRICING</div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            One platform. Seven analysts. Total market vision.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-specter-muted">
            Bring your own OpenAI key. We never charge for model usage.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-specter bg-specter-surface px-4 py-2">
            <span className={`text-sm ${!annual ? 'text-specter-text' : 'text-specter-muted'}`}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={`text-sm ${annual ? 'text-specter-text' : 'text-specter-muted'}`}>
              Annual
            </span>
            <span className="ml-1 rounded-full bg-bull/15 px-2 py-0.5 font-mono text-[0.65rem] text-bull">
              -20%
            </span>
          </div>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-4">
          {TIERS.map((t) => {
            const price = annual ? t.annual : t.monthly;
            return (
              <div
                key={t.name}
                className={`specter-card relative flex flex-col p-7 ${
                  t.popular ? 'border-specter-primary/50 shadow-[0_0_0_1px_hsl(var(--specter-primary)/0.3),0_24px_64px_-24px_hsl(var(--specter-primary)/0.3)]' : ''
                }`}
              >
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-specter-primary px-3 py-1 font-mono text-[0.65rem] font-semibold tracking-wider text-specter-bg">
                    MOST POPULAR
                  </div>
                )}

                <h3 className="text-xl font-semibold">{t.name}</h3>
                <p className="mt-1 text-sm text-specter-muted">{t.desc}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold text-specter-text">${price}</span>
                  <span className="text-sm text-specter-muted">/mo</span>
                </div>
                {annual && t.monthly > 0 && (
                  <p className="mt-1 font-mono text-xs text-specter-muted">
                    billed ${price * 12}/yr
                  </p>
                )}

                <ul className="mt-6 space-y-2.5 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-specter-primary" strokeWidth={2.5} />
                      <span className="text-specter-text/90">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/dashboard" className="mt-7">
                  <Button
                    className={`w-full ${
                      t.popular
                        ? 'bg-specter-primary text-specter-bg hover:bg-specter-primary/90'
                        : 'border border-specter bg-transparent text-specter-text hover:bg-specter-elevated'
                    }`}
                  >
                    {t.cta}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}