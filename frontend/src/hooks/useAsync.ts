import { DependencyList, useCallback, useEffect, useRef, useState } from "react";
import { FriendlyError, toFriendlyError } from "../services/api";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: FriendlyError | null;
  reload: () => void;
}

/** Runs `fn` on mount and whenever deps change. Ignores results from superseded calls. */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [tick, setTick] = useState(0);
  const run = useRef(0);

  useEffect(() => {
    const id = ++run.current;
    setLoading(true);
    setError(null);
    fn()
      .then((d) => { if (id === run.current) setData(d); })
      .catch((e) => { if (id === run.current) setError(toFriendlyError(e)); })
      .finally(() => { if (id === run.current) setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}
