import { useState, useCallback, useEffect } from 'react';

interface UseFetchCompletedTasksTimeframeProps {
  timeframe: string;
  firebaseToken: string | null;
}

const useFetchCompletedTasksTimeframe = ({ timeframe, firebaseToken }: UseFetchCompletedTasksTimeframeProps) => {
  const [completedTasks, setCompletedTasks] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const FetchCompletedTasksTimeframe = useCallback(async () => {
    if (!firebaseToken) {
      setError('No Firebase token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/completed/${timeframe}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Handle token expiry and redirect to login
          setError('Unauthorized. Please login again.');
        } else {
          throw new Error('Failed to fetch completed tasks');
        }
      }

      const data = await response.json();
      const completedCount = Number(data.completedTasks);
      if (!isNaN(completedCount)) {
        setCompletedTasks(completedCount);
      } else {
        setError('Invalid data received for completed tasks');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load completed tasks');
    } finally {
      setLoading(false);
    }
  }, [firebaseToken, timeframe]);

  // Trigger the fetch whenever the component mounts or timeframe changes
  useEffect(() => {
    FetchCompletedTasksTimeframe();  // Call the fetch function inside useEffect
  }, [FetchCompletedTasksTimeframe]);  // The effect will run again if `fetchCompletedTasks` changes

  return { completedTasks, loading, error };
};

export default useFetchCompletedTasksTimeframe;
