// hooks/useFetchTasks.ts
import { useState, useEffect } from "react";

// Define the Task type (same as before)
interface Task {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  due_date: string | null; // ISO 8601 string format
  importance_factor: number | null;
  repeat_interval: { days?: number; months?: number } | null;
  notes: string | null;
  completed: boolean | null;
  completed_at: string | null; // ISO 8601 string format
  created_at: string; // ISO 8601 string format
  updated_at: string; // ISO 8601 string format
  duration: number | null; // Duration in minutes
  repeated: boolean;
}

const useFetchTasks = (firebaseToken: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!firebaseToken) {
        setError("Authentication is required");
        setLoadingTasks(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/get`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to fetch tasks");
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [firebaseToken]);

  return { tasks, loadingTasks, error, setTasks };
};

export default useFetchTasks;
