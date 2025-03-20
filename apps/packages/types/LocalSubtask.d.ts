export type LocalSubtask = {
    uuid: string; // Temporary unique ID for React rendering
    subtask: Subtask_data;
    temp_order: number | null;
  };