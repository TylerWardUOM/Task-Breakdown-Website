import { useApi } from "lib/useApi";
import { Task_data, Task, Subtask_data, Subtask } from "@GlobalTypes/Task";
import { UserSettings } from "@GlobalTypes/UserSettings";
import {
  fetchTasks,
  fetchCompletedTasksTimeframe,
  fetchCategories,
  saveUserSettings,
  fetchUserSettings,
  toggleTaskCompletionRequest,
  deleteTaskRequest,
  saveTask,
  registerUserInDatabase,
  markUserAsVerified,
  saveSubtask,
  fetchSubtasksByTaskId,
  fetchSubtaskById,
  updateSubtask,
  toggleSubtaskCompletionRequest,
  deleteSubtask,
} from "@lib/api";
import { Category } from "@GlobalTypes/Category";

export const useApiWrapper = () => {
  const { apiCall } = useApi();

  return {
    fetchTasks: (): Promise<Task[]> => apiCall(fetchTasks),

    fetchCompletedTasksTimeframe: (timeframe: string): Promise<number> =>
      apiCall(() => fetchCompletedTasksTimeframe(timeframe)),

    fetchCategories: (): Promise<Category[]> => apiCall(fetchCategories),

    saveUserSettings: (settings: UserSettings): Promise<UserSettings> =>
      apiCall(() => saveUserSettings(settings)),

    fetchUserSettings: (): Promise<UserSettings> => apiCall(fetchUserSettings),

    toggleTaskCompletionRequest: (taskId: number, isCompleted: boolean | null): Promise<void> =>
      apiCall(() => toggleTaskCompletionRequest(taskId, isCompleted)),

    deleteTaskRequest: (taskId: number): Promise<void> =>
      apiCall(() => deleteTaskRequest(taskId)),

    saveTask: (taskData: Partial<Task_data>, existingTask?: Task | null): Promise<Task> =>
      apiCall(() => saveTask(taskData, existingTask)),

    registerUserInDatabase: (
      email: string,
      username: string
    ): Promise<{ success: boolean; message?: string; errorCode?: string; errorMessage?: string }> =>
      apiCall(() => registerUserInDatabase(email, username)),

    markUserAsVerified: (email: string): Promise<void> =>
      apiCall(() => markUserAsVerified(email)),

    saveSubtask: (task_id: number, subtaskData: Subtask_data): Promise<Subtask> =>
      apiCall(() => saveSubtask(task_id, subtaskData)),

    fetchSubtasksByTaskId: (taskId: number): Promise<Subtask[]> =>
      apiCall(() => fetchSubtasksByTaskId(taskId)),

    fetchSubtaskById: (subtaskId: number): Promise<Subtask> => // 🔥 FIXED: changed from `string` to `number`
      apiCall(() => fetchSubtaskById(subtaskId)),

    updateSubtask: (subtaskId: number, updatedData: Partial<Subtask_data>): Promise<Subtask> =>
      apiCall(() => updateSubtask(subtaskId, updatedData)),

    toggleSubtaskCompletionRequest: (subtaskId: number, isCompleted: boolean | null): Promise<void> =>
      apiCall(() => toggleSubtaskCompletionRequest(subtaskId, isCompleted)),

    deleteSubtask: (subtaskId: number): Promise<void> =>
      apiCall(() => deleteSubtask(subtaskId)),
  };
};
