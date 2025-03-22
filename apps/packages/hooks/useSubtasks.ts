import { useState, useEffect } from "react";
import { Subtask, Task } from "@GlobalTypes/Task";
import { fetchSubtasksByTaskId, toggleSubtaskCompletionRequest } from "../lib/api";

export const useSubtasks = (tasks: Task[]) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTogglingSubtask, setIsToggling] = useState(false);

  // Fetch subtasks when tasks change
  useEffect(() => {
    if (tasks.length === 0) {
      setSubtasks([]);
      setLoading(false);
      return;
    }

    const fetchAllSubtasks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all subtasks in parallel and flatten the results
        const subtasksArray = await Promise.all(tasks.map((task) => fetchSubtasksByTaskId(task.id)));
        setSubtasks(subtasksArray.flat());
      } catch (err) {
        console.error("Error fetching subtasks:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch subtasks");
        setSubtasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSubtasks();
  }, [tasks]);

  const toggleSubtaskCompletion = async (subtaskId: number) => {
    try {
      const subtask = subtasks.find((s) => s.id === subtaskId);
      if (!subtask) throw new Error("Subtask not found");

      setIsToggling(true);
      await toggleSubtaskCompletionRequest(subtaskId, subtask.completed);

      setSubtasks((prev) =>
        prev.map((s) =>
          s.id === subtaskId
            ? { ...s, completed: !s.completed, completed_at: s.completed ? null : new Date().toISOString() }
            : s
        )
      );
    } catch (error) {
      console.error("Error toggling subtask completion:", error);
    } finally {
      setIsToggling(false);
    }
  };

  return { subtasks, setSubtasks, loading, error, toggleSubtaskCompletion, isTogglingSubtask };
};
