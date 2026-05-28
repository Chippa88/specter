import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook: kicks off an analysis run, polls AnalysisRun for live progress,
 * resolves with the final Analysis id when complete.
 *
 * Returns: { start, run, isRunning, error, reset }
 */
export function useAnalysisRunner() {
  const [run, setRun] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const pollTimer = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setRun(null);
    setIsRunning(false);
    setError(null);
  }, [stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const start = useCallback(async (ticker) => {
    setError(null);
    setIsRunning(true);

    try {
      // Create the AnalysisRun shell
      const runRecord = await base44.entities.AnalysisRun.create({
        ticker: ticker.toUpperCase(),
        status: 'queued',
        progress_pct: 0,
        agent_progress: {},
      });

      setRun(runRecord);

      // Fire the function (don't await — we'll poll for completion)
      base44.functions
        .invoke('runAgentAnalysis', { ticker, run_id: runRecord.id })
        .catch((err) => {
          console.error('runAgentAnalysis invoke failed:', err);
          // Function may still complete server-side — the poller will catch the final state
        });

      // Poll the run record every 1.5s
      pollTimer.current = setInterval(async () => {
        try {
          const fresh = await base44.entities.AnalysisRun.list();
          const current = fresh.find((r) => r.id === runRecord.id);
          if (!current) return;
          setRun(current);

          if (current.status === 'complete' || current.status === 'failed') {
            stopPolling();
            setIsRunning(false);
            if (current.status === 'failed') {
              setError(current.error_message || 'Analysis failed');
            }
          }
        } catch (e) {
          console.error('poll error:', e);
        }
      }, 1500);
    } catch (e) {
      setError(e.message || 'Failed to start analysis');
      setIsRunning(false);
    }
  }, [stopPolling]);

  return { start, run, isRunning, error, reset };
}