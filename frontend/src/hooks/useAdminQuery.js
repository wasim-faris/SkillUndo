import { useCallback, useEffect, useRef, useState } from 'react';
import { unwrapApiData } from '../utils/admin';

export default function useAdminQuery(fetcher, options = {}) {
  const { initialData = null, immediate = true } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(immediate));
  const [error, setError] = useState(null);
  const mountedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetcher();
      const next = unwrapApiData(response);
      if (mountedRef.current) {
        setData(next);
      }
      return next;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher]);

  useEffect(() => {
    mountedRef.current = true;

    if (immediate) {
      queueMicrotask(() => {
        if (mountedRef.current) void load().catch(() => {});
      });
    }

    return () => {
      mountedRef.current = false;
    };
  }, [immediate, load]);

  return { data, loading, error, reload: load, setData };
}
