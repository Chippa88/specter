/**
 * Specter API Client — replaces @base44/sdk entirely
 *
 * Uses localStorage for persistence so the app works standalone
 * without any backend. All data is stored per-user under localStorage keys.
 *
 * Entity schema derived from base44/entities/*.jsonc:
 *   Watchlist, Portfolio, Analysis, AnalysisRun, BriefingLog, UserSettings, Subscription
 */

// ─── localStorage helpers ────────────────────────────────────────────

const STORE_PREFIX = 'specter_'

function getStore(name) {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + name)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function setStore(name, data) {
  localStorage.setItem(STORE_PREFIX + name, JSON.stringify(data))
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function nowISO() {
  return new Date().toISOString()
}

// ─── Entity CRUD factory ─────────────────────────────────────────────

function createEntityStore(entityName) {
  const storeKey = entityName.toLowerCase()

  const list = (orderBy = '-created_date', limit = 100) => {
    let items = getStore(storeKey)
    const desc = orderBy.startsWith('-')
    const field = desc ? orderBy.slice(1) : orderBy
    items.sort((a, b) => {
      const av = a[field] ?? ''
      const bv = b[field] ?? ''
      return desc ? (av < bv ? 1 : -1) : (av < bv ? -1 : 1)
    })
    return items.slice(0, limit)
  }

  const filter = (criteria) => {
    const items = getStore(storeKey)
    return items.filter(item =>
      Object.entries(criteria).every(([k, v]) => item[k] === v)
    )
  }

  const create = (data) => {
    const items = getStore(storeKey)
    const record = {
      id: genId(),
      ...data,
      created_date: nowISO(),
      updated_date: nowISO(),
      created_by_id: localStorage.getItem('specter_user_id') || 'demo',
    }
    items.push(record)
    setStore(storeKey, items)
    return record
  }

  const update = (id, data) => {
    const items = getStore(storeKey)
    const idx = items.findIndex(i => i.id === id)
    if (idx === -1) throw new Error(`${entityName} ${id} not found`)
    items[idx] = { ...items[idx], ...data, updated_date: nowISO() }
    setStore(storeKey, items)
    return items[idx]
  }

  const del = (id) => {
    const items = getStore(storeKey)
    setStore(storeKey, items.filter(i => i.id !== id))
    return { deleted: true }
  }

  return { list, filter, create, update, delete: del }
}

// ─── Auth ────────────────────────────────────────────────────────────

const AUTH_KEY = 'specter_auth'

const auth = {
  me: async () => {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) throw { status: 401, message: 'Not authenticated' }
    return JSON.parse(raw)
  },

  login: async (email, name) => {
    const user = {
      id: genId(),
      email,
      name: name || email.split('@')[0],
      created_date: nowISO(),
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    localStorage.setItem('specter_user_id', user.id)
    return user
  },

  logout: (redirect) => {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem('specter_user_id')
    if (redirect && typeof window !== 'undefined') {
      window.location.href = '/'
    }
  },

  redirectToLogin: (returnUrl) => {
    window.location.href = '/dashboard'
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_KEY)
  },
}

// ─── Server functions (mock + free API integration) ──────────────────

const functions = {
  invoke: async (fnName, args = {}) => {
    switch (fnName) {
      case 'fetchTickerSearch': {
        return await fetchTickerSearch(args.query)
      }
      case 'fetchBatchPrices': {
        return await fetchBatchPrices(args.tickers)
      }
      case 'fetchMacroData': {
        return mockMacroData()
      }
      case 'sendTelegramBriefing': {
        return { sent: false, message: 'Telegram not configured (standalone mode)' }
      }
      default:
        console.warn(`Unknown function: ${fnName}`, args)
        return null
    }
  }
}

// ─── Free API integrations ──────────────────────────────────────────

async function fetchTickerSearch(query) {
  if (!query || query.length < 1) return []
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const data = await resp.json()
    return (data.quotes || []).map(q => ({
      ticker: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      asset_type: q.quoteType === 'CRYPTOCURRENCY' ? 'crypto'
        : q.quoteType === 'ETF' ? 'etf'
        : q.quoteType === 'FUTURE' ? 'futures'
        : 'stock',
      exchange: q.exchange,
    }))
  } catch {
    return []
  }
}

async function fetchBatchPrices(tickers) {
  if (!tickers?.length) return {}
  try {
    // Yahoo Finance batch quote endpoint
    const symbols = tickers.join(',')
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const data = await resp.json()
    const result = {}
    ;(data.quoteResponse?.result || []).forEach(q => {
      result[q.symbol] = {
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
        dayHigh: q.regularMarketDayHigh,
        dayLow: q.regularMarketDayLow,
        volume: q.regularMarketVolume,
        name: q.shortName || q.longName,
      }
    })
    return result
  } catch {
    return {}
  }
}

function mockMacroData() {
  return {
    spy: { price: 548.32, change: 0.42, changePercent: 0.08 },
    vix: { price: 14.28, change: -0.56, changePercent: -3.77 },
    dxy: { price: 104.15, change: 0.12, changePercent: 0.12 },
    tnx: { price: 4.28, change: 0.03, changePercent: 0.71 },
    btc: { price: 68245, change: 1230, changePercent: 1.84 },
    last_updated: nowISO(),
  }
}

// ─── Export ──────────────────────────────────────────────────────────

const entities = {
  Watchlist: createEntityStore('Watchlist'),
  Portfolio: createEntityStore('Portfolio'),
  Analysis: createEntityStore('Analysis'),
  AnalysisRun: createEntityStore('AnalysisRun'),
  BriefingLog: createEntityStore('BriefingLog'),
  UserSettings: createEntityStore('UserSettings'),
  Subscription: createEntityStore('Subscription'),
}

export const base44 = {
  auth,
  entities,
  functions,
}

// For App.jsx — simple auto-login on first visit
export function ensureDemoUser() {
  if (!auth.isAuthenticated()) {
    auth.login('demo@specter.app', 'Demo Trader')
  }
}