import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * useMacroData — fetches FRED macro data via the backend function.
 * Cached for 24 hours per app session.
 *
 * Returns React Query result. On missing_key, error.response.data.error === 'missing_key'.
 */
export function useMacroData() {
  return useQuery({
    queryKey: ['macroData'],
    queryFn: async () => {
      const res = await base44.functions.invoke('fetchMacroData', {});
      // base44.functions.invoke returns an axios-like response
      return res.data;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24h
    gcTime: 24 * 60 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on missing_key / 400s
      const status = error?.response?.status;
      if (status === 400 || status === 401) return false;
      return failureCount < 1;
    },
  });
}

/**
 * Formats a FRED metric for display.
 *  - Fed Rate, 10y, Unemployment → percentage points
 *  - CPI → already a YoY percent
 */
export function formatMacroValue(metric, val) {
  if (val === null || val === undefined) return '—';
  return `${val.toFixed(2)}%`;
}

export function macroDirection(latest, prior) {
  if (latest == null || prior == null) return 0;
  if (Math.abs(latest - prior) < 0.001) return 0;
  return latest > prior ? 1 : -1;
}