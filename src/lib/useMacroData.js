import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/base44Client'

/**
 * useMacroData — fetches macro market data via free Yahoo Finance API.
 * Cached for 5 minutes.
 */
export function useMacroData() {
  return useQuery({
    queryKey: ['macroData'],
    queryFn: async () => {
      const data = await base44.functions.invoke('fetchMacroData', {})
      return data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  })
}

export function formatMacroValue(metric, val) {
  if (val === null || val === undefined) return '\u2014'
  return `${val.toFixed(2)}%`
}

export function macroDirection(latest, prior) {
  if (latest == null || prior == null) return 0
  if (Math.abs(latest - prior) < 0.001) return 0
  return latest > prior ? 1 : -1
}