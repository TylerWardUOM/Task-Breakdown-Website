// 🔹 Repetition Interval (optional)
export interface RepeatInterval {
  days?: number;
  months?: number;
}

// 🔹 Represents a task stored in the database
export interface Task {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  due_date: string | null; // ISO 8601
  importance_factor: number | null;
  repeat_interval: RepeatInterval | null;
  notes: string | null;
  completed: boolean | null;
  completed_at: string | null; // ISO 8601
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  duration: number | null; // Stored in minutes
  repeated: boolean;
}

// 🔹 Represents a subtask stored in the database
export interface Subtask {
  id: number;
  task_id: number;
  title: string;
  description: string | null;
  duration: number | null; // Stored in minutes
  importance_factor: number | null;
  completed: boolean | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  order: number | null
  is_deleted: boolean | undefined;
}


//Data needed to Updte the Table
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
//Data needed to update the table
export interface Subtask_data {
  subtaskId: Subtask.id | undefined
  title: string;
  description: string | null;
  duration: number | null; // Stored in minutes
  importance_factor: number | null;
  order: number | null;
  is_deleted: boolean | undefined;
}