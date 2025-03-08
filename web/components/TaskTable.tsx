import React from "react";
import { PencilIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from "@heroicons/react/solid";

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

interface TaskTableProps {
  tasks: Task[];
  onEdit?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  onFocus?: (taskId: number) => void;
  renderActions?: (task: Task) => JSX.Element;
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

  // Hardcoded weights (future: user-configurable)
  const weightImportance = 4;
  const weightDueDate = 4;
  const weightDuration = 4;

  // Calculate priority score
  const priorityScore =
    (weightImportance * (importance / Math.log2(duration + 1))) +
    (weightDueDate * (1 / (daysUntilDue + 1))) +
    (weightDuration * (1 / (duration + 1)));

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

// Formats a repeat interval value. Accepts either a string or an object.
const formatRepeatInterval = (interval: any): string => {
  if (typeof interval === "string") {
    return interval;
  } else if (typeof interval === "object" && interval.minutes !== undefined) {
    return `${interval.minutes}m ${interval.seconds || 0}s`;
  } else if (typeof interval === "object" && interval.days !== undefined) {
    return `${interval.days} days`;
  }
  return "Invalid interval";
};

// Processes a raw task object by applying default values and formatting certain fields.
const processTask = (task: Task) => {
  return {
    ...task,
    title: task.title || "Untitled Task",
    description: task.description || null,
    category_id: task.category_id ?? "General",
    due_date: task.due_date ?? null,
    importance_factor: task.importance_factor ?? 0,
    duration: task.duration ?? null,
    repeat_interval: task.repeat_interval ? formatRepeatInterval(task.repeat_interval) : null,
    notes: task.notes || "",
    completed: task.completed ?? false,
    completed_at: task.completed_at ? new Date(task.completed_at).toLocaleString() : null,
  };
};

const TaskTable: React.FC<TaskTableProps> = ({ tasks, onEdit, onComplete, onDelete, onFocus, renderActions }) => {
  // Sort tasks by priority and completed status (completed tasks get priority 0)
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityA = a.completed ? 0 : calculatePriority(a);
    const priorityB = b.completed ? 0 : calculatePriority(b);
    return priorityB - priorityA;
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
            // Process the task to apply default values and formatting.
            const processedTask = processTask(task);
            return (
              <tr key={processedTask.id} className={processedTask.completed ? "opacity-50" : ""}>
                <td className="py-2 px-4">
                  <span className={processedTask.completed ? "line-through text-gray-400" : ""}>
                    {processedTask.title}
                  </span>
                </td>
                <td className="py-2 px-4">{calculatePriority(processedTask).toFixed(2)}</td>
                <td className="py-2 px-4">{renderDueDate(processedTask.due_date)}</td>
                <td className="py-2 px-4">{processedTask.category_id}</td>
                <td className="py-2 px-4">{renderDuration(processedTask.duration)}</td>
                <td className="py-2 px-4 flex space-x-2">
                  {renderActions ? renderActions(processedTask) : (
                    <>
                      {onEdit && (
                        <button onClick={() => onEdit(processedTask.id)} className="bg-green-500 text-white px-4 py-2 rounded">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}
                      {onComplete && (
                        <button
                          onClick={() => onComplete(processedTask.id)}
                          className={`px-4 py-2 rounded ${processedTask.completed ? "bg-red-500" : "bg-yellow-500"}`}
                        >
                          {processedTask.completed ? (
                            <XCircleIcon className="h-5 w-5" />
                          ) : (
                            <CheckCircleIcon className="h-5 w-5" />
                          )}
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(processedTask.id)} className="bg-red-500 text-white px-4 py-2 rounded">
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      {onFocus && (
                        <button onClick={() => onFocus(processedTask.id)} className="bg-purple-500 text-white px-4 py-2 rounded flex items-center space-x-2">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      )}
                    </>
                  )}
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
