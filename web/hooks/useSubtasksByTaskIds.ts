import { useState, useEffect } from "react";
import { fetchSubtasksByTaskId } from "../lib/api"; // Ensure this function is correctly implemented
import { Subtask, Task } from "../types/Task";

interface UseSubtasksResult {
  subtasks: Subtask[]; // Now returns a flat list of subtasks
  loading: boolean;
  error: string | null;
}

const useSubtasksByTaskIds = (taskInput: Task[]): UseSubtasksResult => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskInput.length === 0) {
      setSubtasks([]);
      setLoading(false);
      return;
    }

    const fetchAllSubtasks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all subtasks in parallel and flatten the results
        const subtasksArray = await Promise.all(taskInput.map((task) => fetchSubtasksByTaskId(task.id)));
        setSubtasks(subtasksArray.flat());
      } catch (err) {
        setError("Failed to fetch subtasks");
        setSubtasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSubtasks();
  }, [taskInput]);

  return { subtasks, loading, error };
};

export default useSubtasksByTaskIds;
