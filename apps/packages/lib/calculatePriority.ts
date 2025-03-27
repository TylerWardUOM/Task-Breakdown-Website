import { Task } from "@GlobalTypes/Task";
// Calculates the task priority based on importance, due date, and duration.
export const calculatePriority = (task: Task): number => {
  try {
      //Constants
      const durationTaper = Math.E;
      const dueDateRamp = 7;

      const durationMultiplier = 0.1;
      const dueDateMultiplier = 1;
      const importanceMultiplier = 1;


      //Duration Factor
      const duration = task.duration ?? 60;
      const durationFactor= Math.log(duration+1)/Math.log(durationTaper);

      //Due Date Factor
      let dueDateFactor = 0.1;
      const currentDate = new Date();
      const dueDate = task.due_date ? new Date(task.due_date) : null;

      if (dueDate) {
        const timeDifferenceInMs = dueDate.getTime() - currentDate.getTime();
        const daysUntilDue = Math.max(timeDifferenceInMs / (1000 * 3600 * 24), 0); // Ensure non-negative
        dueDateFactor = Math.E**(-daysUntilDue/dueDateRamp);
      }
      

      //Importance Factor
      const importance = task.importance_factor || 5; // Default importance if not set


      // Calculate priority score
      const priorityScore = durationMultiplier*durationFactor * dueDateMultiplier*dueDateFactor * importanceMultiplier * importance;

      if (task.completed) {
        return 0;
      }
      
      // If the task is overdue, return a priority of 11
      if (dueDate && dueDate < currentDate) {
        return 11; // Overdue tasks have the highest priority
      }
      
      return priorityScore;
  } catch (error) {
      console.error("Error calculating priority for task:", task);
      console.error("Error details:", error);
      return 0; // Return lowest priority in case of error
  }
};
