import { Task_data } from "@GlobalTypes/Task";
import { Subtask_data } from "@GlobalTypes/Task";
// 🔹 Represents time in hours & minutes (used for AI task breakdown)
export interface TaskDuration {
  hours: number;
  minutes: number;
}

// 🔹 AI Task Breakdown Response (Now uses `Task_data`)
export interface TaskBreakdownResponse {
  main_task: (Omit<Task_data, "taskId" | "duration"> & {
    duration: TaskDuration | null; // AI returns duration in { hours, minutes }
  });

  subtasks: (Omit<Subtask_data, "subtaskId" | "duration" | "is_deleted"> & {
    duration: TaskDuration | null; // AI returns duration in { hours, minutes }
  })[];
}

