import type { DependencyList } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Runs an async loader on mount (and when deps change) and exposes its state.
export function useAsync<T>(load: () => Promise<T>, deps: DependencyList) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const latest = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loader = useCallback(load, deps);

  const run = useCallback(
    async (isRefresh: boolean) => {
      const id = ++latest.current;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const result = await loader();
        if (id === latest.current) {
          setData(result);
          setError(null);
        }
      } catch (e) {
        if (id === latest.current) setError(e as Error);
      } finally {
        if (id === latest.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [loader],
  );

  useEffect(() => {
    run(false);
  }, [run]);

  return {
    data,
    setData,
    error,
    loading,
    refreshing,
    refresh: () => run(true),
  };
}
