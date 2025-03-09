import { useState, useEffect } from "react";
import { fetchTasks } from "../lib/api"; // Import from lib
import { Task } from "../types/Task";

const useFetchTasks = (firebaseToken: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTasks = async () => {
      if (!firebaseToken) {
        setError("Authentication is required");
        setLoadingTasks(false);
        return;
      }

      try {
        const data = await fetchTasks(firebaseToken); // Use API function
        setTasks(data);
      } catch (err: unknown) {
        console.error("Error fetching tasks:", err);
        
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch tasks");
        }
      } finally {
        setLoadingTasks(false);
      }
    };

    getTasks();
  }, [firebaseToken]);

  return { tasks, loadingTasks, error, setTasks };
};

export default useFetchTasks;
