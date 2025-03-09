export interface RepeatInterval {
    days?: number;
    months?: number;
  }
  
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