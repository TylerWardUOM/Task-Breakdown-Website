import { useState, useEffect } from "react";
import { fetchCompletedTasksTimeframe } from "../lib/api";

interface UseFetchCompletedTasksTimeframeProps {
  timeframe: string;
  firebaseToken: string | null;
}

const useFetchCompletedTasksTimeframe = ({ timeframe, firebaseToken }: UseFetchCompletedTasksTimeframeProps) => {
  const [completedTasks, setCompletedTasks] = useState<number | null>(null);
  const [loadingCompletedTasks, setLoadingCompletedTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCompletedTasks = async () => {
      if (!firebaseToken) {
        setError("Authentication is required");
        setLoadingCompletedTasks(false);
        return;
      }

      try {
        console.log("Fetching tasks with token:", firebaseToken); // Debugging
        const completedCount = await fetchCompletedTasksTimeframe(firebaseToken, timeframe);
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

    if (firebaseToken) {
      getCompletedTasks(); // Only fetch if the token exists
    }
  }, [firebaseToken, timeframe]);

  return { completedTasks, loadingCompletedTasks, error, setCompletedTasks };
};

export default useFetchCompletedTasksTimeframe;
