import { Task } from "../types/Task";

// Calculates the task priority based on importance, due date, and duration.
export const calculatePriority = (task: Task): number => {
  try {
    const currentDate = new Date();
    const importance = task.importance_factor || 5; // Default importance if not set

    // Due date logic
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    let daysUntilDue = Number.MAX_VALUE; // Very high number if no due date

    if (dueDate) {
      const timeDifferenceInMs = dueDate.getTime() - currentDate.getTime();
      daysUntilDue = Math.max(timeDifferenceInMs / (1000 * 3600 * 24), 0); // Ensure non-negative
    }

    if (task.completed) {
      return 0;
    }

    // If the task is overdue, return a priority of 11
    if (dueDate && dueDate < currentDate) {
      return 11; // Overdue tasks have the highest priority
    }

    // Task duration (assume minutes, default to 60 minutes)
    const duration = task.duration ?? 60;

    // Adjusted weights based on desired influence of each factor
    const weightImportance = 3; // Strong influence of importance
    const weightDueDate = 5; // Strong influence of due date
    const weightDuration = 2; // Moderate influence of duration

    // Calculate priority score
    const priorityScore =
      weightImportance * (importance / Math.log2(duration + 1)) +
      weightDueDate * (1 / (daysUntilDue + 1)) + // More weight for tasks due soon
      weightDuration * ((duration + 1) / 60); // Less weight for longer tasks

    return priorityScore;
  } catch (error) {
    console.error("Error calculating priority for task:", task);
    console.error("Error details:", error);
    return 0; // Return lowest priority in case of error
  }
};
