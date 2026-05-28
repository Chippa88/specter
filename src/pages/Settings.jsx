import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SpecterWordmark } from '@/components/brand/SpecterLogo';
import Footer from '@/components/brand/Footer';

function SecretInput({ label, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label className="agent-label mb-2 block text-specter-muted">{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={show ? 'text' : 'password'}
            placeholder="sk-..."
            className="border-specter bg-specter-elevated pr-10 font-mono text-sm text-specter-text placeholder:text-specter-muted"
          />
          <button
            onClick={() => setShow(!show)}
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-specter-muted hover:text-specter-text"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button variant="ghost" className="border border-specter text-specter-text hover:bg-specter-elevated">
          Test
        </Button>
      </div>
      {hint && <p className="mt-1.5 text-[0.7rem] text-specter-muted">{hint}</p>}
    </div>
  );
}

export default function Settings() {
  return (
    <div className="min-h-screen bg-specter-bg text-specter-text">
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

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-specter-muted">
          API keys, briefings, broker sync, and subscription.
        </p>

        {/* API KEYS */}
        <section className="mt-10">
          <div className="agent-label mb-4 text-specter-primary">API Keys</div>
          <div className="specter-card space-y-5 p-6">
            <SecretInput label="OpenAI API Key" hint="Required. Specter uses your key — model usage billed by OpenAI." />
            <SecretInput label="Finnhub API Key" hint="Used for news + sentiment. Free tier: 60 req/min." />
            <SecretInput label="Polygon.io API Key" hint="Market data. Free tier: 5 req/min." />
            <SecretInput label="FRED API Key" hint="Macro data — Fed Rate, CPI, yields, unemployment." />
          </div>
        </section>

        {/* ALPACA */}
        <section className="mt-10">
          <div className="agent-label mb-4 text-specter-primary">Alpaca Broker Sync</div>
          <div className="specter-card space-y-5 p-6">
            <div className="flex items-start gap-3 rounded-md border border-[hsl(41_100%_50%/0.3)] bg-[hsl(41_100%_50%/0.05)] p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-caution" />
              <p className="text-xs leading-relaxed text-specter-text/90">
                Paper trading mode is enabled by default. Live trading requires explicit confirmation.
              </p>
            </div>
            <SecretInput label="Alpaca API Key" />
            <SecretInput label="Alpaca Secret Key" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-specter-text">Paper Trading</Label>
                <p className="text-xs text-specter-muted">Always recommended for MVP.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>

        {/* TELEGRAM */}
        <section className="mt-10">
          <div className="agent-label mb-4 text-specter-primary">Telegram</div>
          <div className="specter-card p-6">
            <Label className="agent-label mb-2 block text-specter-muted">Chat ID</Label>
            <div className="flex gap-2">
              <Input
                placeholder="123456789"
                className="border-specter bg-specter-elevated font-mono text-specter-text placeholder:text-specter-muted"
              />
              <Button className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
                <Send className="mr-1.5 h-4 w-4" />
                Test Message
              </Button>
            </div>
            <p className="mt-2 text-[0.7rem] text-specter-muted">
              Specter sends "👻 Specter is connected." to verify your chat.
            </p>
          </div>
        </section>

        {/* PREFERENCES */}
        <section className="mt-10">
          <div className="agent-label mb-4 text-specter-primary">Preferences</div>
          <div className="specter-card space-y-5 p-6">
            <div>
              <Label className="agent-label mb-3 block text-specter-muted">Risk Tolerance</Label>
              <div className="grid grid-cols-3 gap-2">
                {['Conservative', 'Moderate', 'Aggressive'].map((r) => (
                  <button
                    key={r}
                    className={`rounded-md border px-4 py-2.5 text-sm transition-colors ${
                      r === 'Moderate'
                        ? 'border-specter-primary/50 bg-specter-primary/10 text-specter-primary'
                        : 'border-specter text-specter-muted hover:border-specter-primary/30 hover:text-specter-text'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[0.7rem] text-specter-muted">
                Shapes how Risk Manager sizes positions and weighs verdicts.
              </p>
            </div>
          </div>
        </section>

        {/* SUBSCRIPTION */}
        <section className="mt-10">
          <div className="agent-label mb-4 text-specter-primary">Subscription</div>
          <div className="specter-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-specter bg-specter-elevated px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-bull" />
                  <span className="font-mono text-xs">FREE</span>
                </div>
                <p className="mt-3 font-mono text-sm">
                  <span className="text-data">0</span>
                  <span className="text-specter-muted"> / 5 analyses used</span>
                </p>
              </div>
              <Link to="/pricing">
                <Button className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
                  Upgrade
                </Button>
              </Link>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-specter-elevated">
              <div className="h-full bg-specter-primary" style={{ width: '0%' }} />
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}