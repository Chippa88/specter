import React from 'react';
import { Link } from 'react-router-dom';
import { SpecterWordmark } from './SpecterLogo';

export default function Footer() {
  return (
    <footer className="border-t border-specter bg-specter-bg">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <SpecterWordmark />
            <p className="mt-4 text-sm leading-relaxed text-specter-muted">
              The market has a Specter. 7 AI analysts. Total market vision.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            <Link to="/" className="text-specter-muted hover:text-specter-text">Home</Link>
            <Link to="/pricing" className="text-specter-muted hover:text-specter-text">Pricing</Link>
            <Link to="/dashboard" className="text-specter-muted hover:text-specter-text">Dashboard</Link>
            <Link to="/settings" className="text-specter-muted hover:text-specter-text">Settings</Link>
          </div>
        </div>

        <div className="mt-10 border-t border-specter pt-6">
          <p className="text-[0.72rem] leading-relaxed text-specter-muted">
            <span className="font-semibold text-specter-text/80">Disclaimer.</span>{' '}
            For informational purposes only. Not financial advice. Specter does not guarantee
            accuracy. All investments carry risk. Past performance is not indicative of future
            results.
          </p>
          <p className="mt-3 font-mono text-[0.7rem] text-specter-muted/70">
            © {new Date().getFullYear()} Specter · specter.trade
          </p>
        </div>
      </div>
    </footer>
  );
}