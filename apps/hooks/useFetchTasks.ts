import { Task } from "@GlobalTypes/Task";
import { fetchTasks } from "@lib/api";
import { useState, useEffect } from "react";


const useFetchTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTasks = async () => {
      try {
        const data = await fetchTasks(); // Use API function
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
  }, []);

  return { tasks, loadingTasks, error, setTasks };
};

export default useFetchTasks;
