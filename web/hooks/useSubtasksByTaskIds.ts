import { useState, useEffect } from 'react';
import { fetchSubtasksByTaskId } from '../lib/api'; // Assuming the `fetchSubtasksByTaskId` function is in this file
import { Subtask, Task } from '../types/Task';


interface UseSubtasksResult {
  subtasks: Record<string, Subtask[]>; // Map taskId to list of subtasks
  loading: boolean;
  error: string | null;
}

const useSubtasksByTaskIds = (taskInput: (Task)[]): UseSubtasksResult => {
  const [subtasks, setSubtasks] = useState<Record<string, Subtask[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllSubtasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const subtasksMap: Record<string, Subtask[]> = {};

        for (const task of taskInput) {
          const taskId = task.id;

          const subtasksData = await fetchSubtasksByTaskId(taskId);
          subtasksMap[taskId] = subtasksData;
        }

        setSubtasks(subtasksMap);
      } catch (err) {
        setError('Failed to fetch subtasks');
      } finally {
        setLoading(false);
      }
    };

    fetchAllSubtasks();
  }, [taskInput]);

  return { subtasks, loading, error };
};

export default useSubtasksByTaskIds;
