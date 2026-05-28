import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/base44Client'

/**
 * Hook: fetches live prices for a list of tickers via batch endpoint.
 * Cached 60s. Returns { prices: {TICKER: {...}}, ... }
 */
export function useLivePrices(tickers) {
  const sorted = [...(tickers || [])].map((t) => t.toUpperCase()).sort()
  const key = sorted.join(',')

  return useQuery({
    queryKey: ['livePrices', key],
    queryFn: async () => {
      if (sorted.length === 0) return { prices: {} }
      const data = await base44.functions.invoke('fetchBatchPrices', { tickers: sorted })
      return { prices: data || {} }
    },
    enabled: sorted.length > 0,
    staleTime: 60 * 1000,
    refetchInterval: 90 * 1000,
    refetchOnWindowFocus: false,
  })
}