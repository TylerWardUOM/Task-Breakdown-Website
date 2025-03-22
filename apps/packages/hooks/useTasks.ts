import { useCallback, useEffect, useState } from "react";
import { Subtask_data, Task } from "@GlobalTypes/Task";
import { toggleTaskCompletionRequest, deleteTaskRequest, fetchTasks, saveSubtask, saveTask, fetchCompletedTasksTimeframe } from "../lib/api";
import { formatRepeatInterval } from "@Utils/TaskModalUtils";

export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTogglingTask, setIsToggling] = useState(false);
    const [isDeletingTask, setIsDeleting] = useState(false);
    const [completedTasks, setCompletedTasks] = useState<number | null>(null);
    const [loadingCompletedTasks, setLoadingCompletedTasks] = useState(false);
    const [completedTasksError, setCompletedTasksError] = useState<string | null>(null);

      // Fetch tasks on mount
  useEffect(() => {
    const getTasks = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      } finally {
        setLoadingTasks(false);
      }
    };

    getTasks();
  }, []);

  const toggleTaskCompletion = async (taskId: number) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error("Task not found");

      setIsToggling(true);
      await toggleTaskCompletionRequest(taskId, task.completed);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, completed: !t.completed, completed_at: t.completed ? null : new Date().toISOString() }
            : t
        )
      );
    } catch (error) {
      console.error("Error toggling task completion:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      setIsDeleting(true);
      await deleteTaskRequest(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const prepareTaskData = (existingTask: Task | null, taskDetails: any) => {
    const totalDuration = (taskDetails.hours || 0) * 60 + (taskDetails.minutes || 0);

    return {
      taskId: existingTask?.id || undefined,
      title: taskDetails.taskTitle,
      description: taskDetails.description || null,
      due_date: taskDetails.dueDate || null,
      importance_factor: taskDetails.importanceValue,
      duration: totalDuration || null,
      repeat_interval: taskDetails.repeatTask !== "None" ? formatRepeatInterval(taskDetails.repeatTask) : null,
      category_id: taskDetails.category ? parseInt(taskDetails.category) : null,
    };
  };

  const saveTaskData = async (existingTask: Task | null, taskDetails: any, subtasks: Subtask_data[], onSave: (task: Task) => void) => {
    try {
      const taskData = prepareTaskData(existingTask, taskDetails);
      const savedTask = await saveTask(taskData, existingTask);

      await Promise.all(subtasks.map(async (subtask) => await saveSubtask(savedTask.id, subtask)));

      setTasks((prev) => (existingTask ? prev.map((t) => (t.id === savedTask.id ? savedTask : t)) : [...prev, savedTask]));

      onSave(savedTask);
      return savedTask;
    } catch (err) {
      console.error("Error saving task:", err);
      throw err;
    }
  };

  const fetchCompletedTasksByTimeframe = useCallback(async (timeframe: string) => {
    setLoadingCompletedTasks(true);
    setCompletedTasksError(null);
  
    try {
      const completedCount = await fetchCompletedTasksTimeframe(timeframe);
      setCompletedTasks(completedCount);
    } catch (err) {
      console.error("Error fetching completed tasks:", err);
      setCompletedTasksError(err instanceof Error ? err.message : "Failed to load completed tasks");
    } finally {
      setLoadingCompletedTasks(false);
    }
  }, []); // Remove `loadingCompletedTasks` dependency to avoid unnecessary recreation
  

  return { tasks, setTasks, loadingTasks, error, toggleTaskCompletion, 
    deleteTask, isTogglingTask, isDeletingTask,saveTaskData,
    completedTasks,
    loadingCompletedTasks,
    completedTasksError,
    fetchCompletedTasksByTimeframe,};
};
