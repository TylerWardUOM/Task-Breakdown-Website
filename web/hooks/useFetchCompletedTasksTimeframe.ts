import { useState, useCallback, useEffect } from "react";
import { fetchCompletedTasksTimeframe } from "../lib/api";

interface UseFetchCompletedTasksTimeframeProps {
  timeframe: string;
  firebaseToken: string | null;
}

const useFetchCompletedTasksTimeframe = ({ timeframe, firebaseToken }: UseFetchCompletedTasksTimeframeProps) => {
  const [completedTasks, setCompletedTasks] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!firebaseToken) {
      setError("No Firebase token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const completedCount = await fetchCompletedTasksTimeframe(firebaseToken, timeframe);
      setCompletedTasks(completedCount);
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load completed tasks");
      }
    } finally {
      setLoading(false);
    }
  }, [firebaseToken, timeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { completedTasks, loading, error };
};

export default useFetchCompletedTasksTimeframe;
