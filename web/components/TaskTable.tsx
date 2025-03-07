import React from "react";
import { PencilIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from "@heroicons/react/solid";

// Define the Task interface to match the backend data
interface Task {
  id: number; // ✅ Updated from taskId to match backend
  title: string | null;
  description: string | null;
  due_date: string | null;
  importance_factor: number | null;
  duration: string | { minutes: number; seconds: number } | null;
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

const TaskTable: React.FC<TaskTableProps> = ({ tasks, onEdit, onComplete, onDelete, onFocus, renderActions }) => {
  // Helper function to calculate priority
  const calculatePriority = (task: Task): number => {
    const currentDate = new Date();
    const importance = task.importance_factor || 5;

    // Due date logic: the closer the task is to the current date, the higher the priority
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    let dueDatePriority = 0;
    if (dueDate) {
      const timeDifferenceInMs = dueDate.getTime() - currentDate.getTime();
      const timeDifferenceInDays = timeDifferenceInMs / (1000 * 3600 * 24); // Days difference
      if (timeDifferenceInDays < 0) {
        // Overdue task gets a higher priority
        dueDatePriority = 10;
      } else if (timeDifferenceInDays <= 1) {
        // Tasks due in the next 24 hours
        dueDatePriority = 9;
      } else if (timeDifferenceInDays <= 7) {
        // Tasks due in the next 7 days
        dueDatePriority = 7;
      } else {
        dueDatePriority = 4; // Tasks due in more than a week
      }
    }

    // Duration logic: longer tasks get a higher priority
    let durationPriority = 0;
    if (task.duration && typeof task.duration !== "string") {
      const totalMinutes = task.duration.minutes + task.duration.seconds / 60;
      if (totalMinutes <= 30) {
        durationPriority = 4; // Short tasks
      } else if (totalMinutes <= 60) {
        durationPriority = 7; // Medium-length tasks
      } else {
        durationPriority = 9; // Long tasks
      }
    }

    // Combining all factors to calculate the final priority
    let priority = (importance + dueDatePriority + durationPriority) / 3;

    // Ensure priority is between 1 and 10
    if (priority > 10) priority = 10;
    if (priority < 1) priority = 1;

    return priority;
  };

  // Format the duration properly
  const renderDuration = (duration: Task["duration"]) => {
    if (!duration) return "No duration specified";
    if (typeof duration === "string") return duration;
    if (typeof duration === "object" && "minutes" in duration && "seconds" in duration) {
      return `${duration.minutes}m ${duration.seconds}s`;
    }
    return "Invalid duration";
  };

  // Format due date properly
  const renderDueDate = (due_date: string | null) => {
    if (!due_date) return "No due date";
    return new Date(due_date).toLocaleDateString();
  };

  // Sort tasks by priority and completed status (completed tasks have priority 0)
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityA = a.completed ? 0 : calculatePriority(a);
    const priorityB = b.completed ? 0 : calculatePriority(b);
    return priorityB - priorityA; // Sort in descending order (higher priority first)
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
          {sortedTasks.map((task) => (
            <tr key={task.id} className={task.completed ? "opacity-50" : ""}>
              <td className="py-2 px-4">
                <span className={task.completed ? "line-through text-gray-400" : ""}>
                  {task.title || "No title"}
                </span>
              </td>
              <td className="py-2 px-4">
                <div className="flex items-center">
                  {/* Render priority as stars */}
                  {[...Array(Math.round(calculatePriority(task)))].map((_, index) => (
                    <span key={index} className="text-yellow-500">★</span>
                  ))}
                </div>
              </td>
              <td className="py-2 px-4">{renderDueDate(task.due_date)}</td>
              <td className="py-2 px-4">{task.category_id ? `Category ${task.category_id}` : "Uncategorized"}</td>
              <td className="py-2 px-4">{renderDuration(task.duration)}</td>
              <td className="py-2 px-4 flex space-x-2">
                {renderActions ? renderActions(task) : (
                  <>
                    {onEdit && (
                      <button onClick={() => onEdit(task.id)} className="bg-green-500 text-white px-4 py-2 rounded">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {onComplete && (
                      <button onClick={() => onComplete(task.id)} className={`px-4 py-2 rounded ${task.completed ? "bg-red-500" : "bg-yellow-500"}`}>
                        {task.completed ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(task.id)} className="bg-red-500 text-white px-4 py-2 rounded">
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                    {onFocus && (
                      <button onClick={() => onFocus(task.id)} className="bg-purple-500 text-white px-4 py-2 rounded flex items-center space-x-2">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
