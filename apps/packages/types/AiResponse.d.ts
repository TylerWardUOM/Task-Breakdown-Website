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

subtasks: (Omit<Subtask_data_data, "subtaskId" | "duration"> & {
    duration: TaskDuration | null; // AI returns duration in { hours, minutes }
})[];
}