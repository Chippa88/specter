# Specter 👻

**7 AI analysts watch every ticker. One verdict. Total vision.**

Specter is an AI-powered market intelligence terminal that deploys seven specialized analyst agents on any stock, ETF, futures, or crypto ticker.

## Features

- **7 AI Analyst Agents** — Fundamentals, Technicals, Sentiment, News, Bull Case, Bear Case, Risk Manager
- **Live Market Data** — Real-time prices via Yahoo Finance API
- **Dashboard** — Analysis, Watchlist, Portfolio, Macro indicators, Daily Briefings
- **Bring Your Own API Key** — No subscriptions required to start
- **Standalone App** — Fully decoupled from Base44, runs on GitHub Pages

## Pricing

| Plan | Price | Analyses | Agents | Extras |
|------|-------|----------|--------|--------|
| Free | $0/mo | 5/mo | 4 basic | — |
| Starter | $29/mo | 50/mo | All 7 | Telegram briefings |
| Pro | $59/mo | 200/mo | All 7 | Alpaca sync, PDF export |
| Elite | $99/mo | Unlimited | All 7 | Priority, broker sync |

## Quick Start

```bash
npm install
npm run dev     # Development server
npm run build   # Production build
```

## Tech Stack

- React 18 + Vite 6
- Tailwind CSS 3
- React Query (TanStack)
- React Router
- Radix UI primitives
- Recharts
- Framer Motion
- Yahoo Finance API (free)

## Deployment

```bash
npm run build
npx gh-pages -d dist
```

The app is deployed at: **https://chippa88.github.io/specter/**
