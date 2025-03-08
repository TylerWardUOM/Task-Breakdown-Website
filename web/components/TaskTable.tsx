import React from "react";

// Define the Task interface to match the backend data
interface Task {
  id: number;
  title: string | null;
  description: string | null;
  due_date: string | null;
  importance_factor: number | null;
  duration: number | null; // duration in minutes
  repeat_interval: string | null;
  category_id: number | null;
  notes: string | null;
  completed: boolean | null;
  completed_at: string | null;
}

interface ColorScheme {
  overdue: string;        // Color for overdue tasks
  lowPriority: string;    // Color for low priority tasks
  mediumPriority: string; // Color for medium priority tasks
  highPriority: string;   // Color for high priority tasks
}

interface TaskTableProps {
  tasks: Task[];
  onEdit?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  onFocus?: (taskId: number) => void;
  // @ts-ignore
  renderActions?: (task: Task) => JSX.Element;
  colorScheme: ColorScheme;       // New prop for custom color schemes
  colorSchemeEnabled: boolean;    // New prop to toggle the color gradient
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
  if (priority === 0) return colorScheme.overdue; // Red for overdue tasks

  // Gradient logic for priority levels
  if (priority <= 3) {
    return colorScheme.lowPriority; // Low priority (Green)
  } else if (priority <= 7) {
    return colorScheme.mediumPriority; // Medium priority (Yellow)
  } else {
    return colorScheme.highPriority; // High priority (Red)
  }
};

const TaskTable: React.FC<TaskTableProps> = ({ tasks, renderActions, colorScheme, colorSchemeEnabled }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center p-4">
        <p>No tasks available</p>
      </div>
    );
  }
  // Sort tasks by due date (overdue tasks first) and then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityA = a.completed ? 0 : calculatePriority(a);
    const priorityB = b.completed ? 0 : calculatePriority(b);

    // Overdue tasks should be prioritized first (due date logic)
    const overdueA = a.due_date && new Date(a.due_date) < new Date();
    const overdueB = b.due_date && new Date(b.due_date) < new Date();

    if (overdueA && !overdueB) return -1;
    if (!overdueA && overdueB) return 1;

    return priorityB - priorityA; // Then by priority
  });

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg mt-4">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">Task Title</th>
            <th className="py-2 px-4 text-left">Priority</th>
            <th className="py-2 px-4 text-left">Due Date</th>
            <th className="py-2 px-4 text-left">Category</th>
            <th className="py-2 px-4 text-left">Duration</th>
            <th className="py-2 px-4 text-left">Actions</th>
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
                <td className="py-2 px-4">{task.category_id}</td>
                <td className="py-2 px-4">{renderDuration(task.duration)}</td>
                <td className="py-2 px-4 flex space-x-2">
                  {renderActions ? renderActions(task) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
