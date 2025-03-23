import { useState, useEffect } from "react";
import { useApiWrapper } from "./useApiWrapper";

interface UseFetchCompletedTasksTimeframeProps {
  timeframe: string;
}

const useFetchCompletedTasksTimeframe = ({ timeframe}: UseFetchCompletedTasksTimeframeProps) => {
  const [completedTasks, setCompletedTasks] = useState<number | null>(null);
  const [loadingCompletedTasks, setLoadingCompletedTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchCompletedTasksTimeframe } = useApiWrapper(); // ✅ Wrapped API call

  useEffect(() => {
    const getCompletedTasks = async () => {
      try {
        const completedCount = await fetchCompletedTasksTimeframe(timeframe);
        setCompletedTasks(completedCount);
      } catch (err: unknown) {
        console.error("Error fetching completed tasks:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load completed tasks");
        }
      } finally {
        setLoadingCompletedTasks(false);
      }
    };
      getCompletedTasks(); // Only fetch if the token exists
  }, [timeframe]);

  return { completedTasks, loadingCompletedTasks, error, setCompletedTasks };
};

export default useFetchCompletedTasksTimeframe;
