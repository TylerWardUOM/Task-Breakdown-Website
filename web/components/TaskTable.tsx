import React from "react";
import { Task } from "../types/Task";
import { Category } from "../types/Category";

interface ColorScheme {
  overdue: string;        // Color for overdue tasks
  lowPriority: string;    // Color for low priority tasks
  mediumPriority: string; // Color for medium priority tasks
  highPriority: string;   // Color for high priority tasks
}

interface TaskTableProps {
  tasks: Task[];
  categories: Category[]; // Added categories prop
  filter: string | null; // The current filter to apply (e.g., due this week, priority > 7)
  minPriority?: number; // Optional minPriority
  maxPriority?: number; // Optional maxPriority
  sortBy: string; // Sort by priority, due date, etc.
  onEdit?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  onFocus?: (taskId: number) => void;
  // @ts-expect-error: Ignoring error because JSX is properly handled in this project
  renderActions?: (task: Task) => JSX.Element;
  colorScheme: ColorScheme;       // New prop for custom color schemes
  colorSchemeEnabled: boolean;    // New prop to toggle the color gradient
  showCompletedTasks?: boolean; // New optional prop
  emptyStateMessage?: React.ReactNode;
}

// Calculates the task priority based on importance, due date and duration.
const calculatePriority = (task: Task): number => {
  const currentDate = new Date();
  const importance = task.importance_factor || 5; // Default importance if not set

  // Due date logic
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  let daysUntilDue = Number.MAX_VALUE; // Very high number if no due date
  if (dueDate) {
    const timeDifferenceInMs = dueDate.getTime() - currentDate.getTime();
    daysUntilDue = Math.max(timeDifferenceInMs / (1000 * 3600 * 24), 0); // Ensure non-negative
  }

  if (task.completed){
    return 0;
  }

  // If the task is overdue, return a priority of 11
  if (dueDate && dueDate < currentDate) {
    return 11; // Overdue tasks have the highest priority
  }

  // Task duration (assume minutes, default to 60 minutes)
  const duration = task.duration ?? 60;

  // Adjusted weights based on desired influence of each factor
  const weightImportance = 3;  // Strong influence of importance
  const weightDueDate = 5;     // Strong influence of due date
  const weightDuration = 2;    // Moderate influence of duration

  // Calculate priority score
  const priorityScore =
    (weightImportance * (importance / Math.log2(duration + 1))) +
    (weightDueDate * (1 / (daysUntilDue + 1))) +  // More weight for tasks due soon
    (weightDuration * (1 / (duration + 1)));      // Less weight for longer tasks

  // Normalize between 1 and 10
  const minPriority = 1;
  const maxPriority = 10;
  const normalizedPriority = Math.min(Math.max(minPriority, priorityScore), maxPriority);

  return normalizedPriority;
};

// Formats the duration (in minutes) into a human-readable string.
const renderDuration = (duration: Task["duration"]) => {
  if (duration === null) return "N/A";
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

// Formats the due date for display.
const renderDueDate = (due_date: string | null) => {
  if (!due_date) return "N/A";
  return new Date(due_date).toLocaleDateString();
};

// Determines the background color for a row based on priority and color scheme.
const getPriorityColor = (priority: number, colorScheme: ColorScheme, colorSchemeEnabled: boolean): string => {
  if (!colorSchemeEnabled) return ""; // If gradient is not enabled, return no color

  // Overdue tasks should have a distinct color (red)
  if (priority === 11) return colorScheme.overdue; // Red for overdue tasks

  // Gradient logic for priority levels
  if (priority <= 3) {
    return colorScheme.lowPriority; // Low priority (Green)
  } else if (priority <= 7) {
    return colorScheme.mediumPriority; // Medium priority (Yellow)
  } else {
    return colorScheme.highPriority; // High priority (Red)
  }
};

// Modify sorting logic based on the selected sortBy prop
const getSortedTasks = (tasks: Task[], sortBy: string) => {
  return tasks.sort((a, b) => {
    if (sortBy === "priority") {
      // Sort by priority
      return calculatePriority(b) - calculatePriority(a);
    }

    if (sortBy === "dueDate") {
      const dueDateA = a.due_date ? new Date(a.due_date) : new Date(8640000000000000);
      const dueDateB = b.due_date ? new Date(b.due_date) : new Date(8640000000000000);

      // First, sort by due date
      const dueDateComparison = dueDateA.getTime() - dueDateB.getTime();
      
      // If due dates are the same, sort by priority (higher priority first)
      if (dueDateComparison === 0) {
        return calculatePriority(b) - calculatePriority(a);
      }

      return dueDateComparison;
    }

    return 0;
  });
};


// Modify filtering logic to consider completed tasks visibility
const getFilteredTasks = (
  tasks: Task[],
  filter: string | null,
  showCompletedTasks: boolean,
  minPriority?: number,
  maxPriority?: number
) => {
  let filteredTasks = tasks;

  if (!showCompletedTasks) {
    // Filter out completed tasks unless explicitly allowed
    filteredTasks = filteredTasks.filter((task) => !task.completed);
  }

  if (filter === "priorityRange" && minPriority !== undefined && maxPriority !== undefined) {
    filteredTasks = filteredTasks.filter((task) => {
      const taskPriority = calculatePriority(task);
      return taskPriority >= minPriority && taskPriority <= maxPriority;
    });
  }

  if (filter === "thisWeek") {
    const currentDate = new Date();
    const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    const weekEnd = new Date(currentDate.setDate(currentDate.getDate() + 6 - currentDate.getDay()));

    filteredTasks = filteredTasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDueDate = new Date(task.due_date);
      return taskDueDate >= weekStart && taskDueDate <= weekEnd;
    });
  }

  if (filter === "Priority>7") {
    filteredTasks = filteredTasks.filter((task) => calculatePriority(task) > 7);
  }

  if (filter === "overDue") {
    const currentDate = new Date();
    filteredTasks = filteredTasks.filter((task) => {
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        return dueDate < currentDate && !task.completed;
      }
      return false;
    });
  }

  if (filter === "highPriority") {
    // Sort tasks by priority in descending order and get the top 5
    filteredTasks = [...filteredTasks]
      .sort((a, b) => calculatePriority(b) - calculatePriority(a))
      .slice(0, 5);
  }

  return filteredTasks;
};

// Function to get category name from category ID
const getCategoryName = (categoryId: number | null, categories: Category[]) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : "Uncategorized";
};

const TaskTable: React.FC<TaskTableProps> = ({ 
    tasks,
    categories, 
    filter,
    minPriority,
    maxPriority,
    sortBy,
    renderActions,
    colorScheme,
    colorSchemeEnabled,
    showCompletedTasks = false,
    emptyStateMessage
  }) => {


  // Apply filtering, including completed tasks visibility
  const filteredTasks = getFilteredTasks(tasks, filter, showCompletedTasks, minPriority, maxPriority);
  if (filteredTasks.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-100 rounded-lg shadow-md">
        {emptyStateMessage || (
          <>
            <p className="text-lg font-semibold text-gray-700">No tasks at the moment!</p>
            <p className="text-gray-500">Start by adding some tasks to stay organized.</p>
          </>
        )}
      </div>
    );
  }
  
  // Apply sorting
  const sortedTasks = getSortedTasks(filteredTasks, sortBy);

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg mt-4 w-full">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">Task Title</th>
            <th className="py-2 px-4 text-left">Priority</th>
            <th className="py-2 px-4 text-left">Due Date</th>
            <th className="py-2 px-4 text-left">Category</th>
            <th className="py-2 px-4 text-left">Duration</th>
            {/* Conditionally render Actions column */}
            {renderActions && <th className="py-2 px-4 text-left">Actions</th>}          
            </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => {
            const priority = calculatePriority(task);
            const priorityColor = getPriorityColor(priority, colorScheme, colorSchemeEnabled);
            return (
              <tr key={task.id} className={priorityColor}>
                <td className="py-2 px-4">
                  <span className={task.completed ? "line-through text-gray-400" : ""}>
                    {task.title || "Untitled Task"}
                  </span>
                </td>
                <td className="py-2 px-4">{priority.toFixed(2)}</td>
                <td className="py-2 px-4">{renderDueDate(task.due_date)}</td>
                <td className="py-2 px-4">{getCategoryName(task.category_id,categories)}</td>
                <td className="py-2 px-4">{renderDuration(task.duration)}</td>
                {/* Conditionally render Actions column */}
                {renderActions && (
                  <td className="py-2 px-4 flex space-x-2 w-auto">
                    {renderActions(task)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
