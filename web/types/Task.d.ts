export interface RepeatInterval {
    days?: number;
    months?: number;
  }
  
//Task type from my database used when tasks are displayed  
export interface Task {
    id: number;
    user_id: number;
    category_id: number | null;
    title: string;
    description: string | null;
    due_date: string | null; // ISO 8601 string format
    importance_factor: number | null;
    repeat_interval: RepeatInterval | null;
    notes: string | null;
    completed: boolean | null;
    completed_at: string | null; // ISO 8601 string format
    created_at: string; // ISO 8601 string format
    updated_at: string; // ISO 8601 string format
    duration: number | null; // Duration in minutes
    repeated: boolean;
  }

//Type used by manual task creation modal
export interface Task_data{
  taskId: Task.id | undefined,
  title: string,
  description: string | null,
  due_date: string | null,
  importance_factor: number | null,
  duration: number | null,
  repeat_interval: string | null,
  category_id: number | null,
}
export interface Subtask {
  id: number; // Unique subtask ID
  task_id: number; // Associated main task ID
  title: string;
  description: string | null;
  duration: number | null; // Duration in minutes
  importance_factor: 2 | 4 | 8 | 10; // Importance levels
  completed: boolean | null;
  completed_at: string | null; // ISO 8601 format (null if not completed)
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
}

export interface Subtask_data {
  subtask_id: Subtask.id | undefined;
  task_id: number; // Associated main task ID
  title: string;
  description: string | null;
  duration: number | null;
  importance_factor: 2 | 4 | 8 | 10;
  completed: boolean | null;
  completed_at: string | null; // ISO 8601 format (null if not completed)
}

// 🔹 Define types for response structure
//These are types for all the ai stuff
interface TaskDuration {
  hours: number;
  minutes: number;
}

interface MainTask {
  title: string;
  description: string | null;
  duration: TaskDuration | null;
}

interface SubTask {
  title: string;
  description: string| null;
  duration: TaskDuration | null;
  importance_factor: 2 | 4 | 8 | 10;
}

interface TaskBreakdownResponse {
  main_task: MainTask;
  subtasks: SubTask[];
}