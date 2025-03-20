export interface Category {
    id: number;
    user_id: number | null; // Null for default categories
    name: string;
    is_default: boolean;
    created_at: string;
  }
  