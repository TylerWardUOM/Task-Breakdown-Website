import React, { useState } from "react";
import { Subtask, Task } from "../types/Task";
import { Category } from "../types/Category";
import { Filter } from "../types/Filter";
import { ColourScheme } from "../types/userSettings";
import { calculatePriority } from "../lib/calculatePriority";


interface TaskTableProps {
  tasks: Task[];
  categories: Category[]; // Added categories prop
  selectedFilter: {       // Updated filter type
    filter: string | null;
    minPriority: number;
    maxPriority: number;
    selectedCategories: number[]; // category ids
  };
  sortBy: string; // Sort by priority, due date, etc.
  onEdit?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  onFocus?: (taskId: number) => void;
  // @ts-expect-error: Ignoring error because JSX is properly handled in this project
  renderActions?: (task: Task) => JSX.Element;
  colourScheme: ColourScheme;       // New prop for custom colour schemes
  colourSchemeEnabled: boolean;    // New prop to toggle the colour gradient
  showCompletedTasks?: boolean; // New optional prop
  emptyStateMessage?: React.ReactNode;
  visibleColumns?: string[]; 
  subtasks?: Subtask[]; 
}

interface TaskRowProps{
  task: Task;
  subtasks?: Subtask[];
  expanded: boolean;
  visibleColumns?: string[]; 
  colourScheme: ColourScheme;       // New prop for custom colour schemes
  colourSchemeEnabled: boolean;
  toggleTask: (taskId: number) => void;
    // @ts-expect-error: Ignoring error because JSX is properly handled in this project
  renderActions?: (task: Task) => JSX.Element;
  categories: Category[];
}

const DEFAULT_COLUMNS = ["title", "priority", "due_date", "category", "duration", "order"];


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

// Determines the background colour for a row based on priority and colour scheme.
const getPrioritycolour = (priority: number, colourScheme: ColourScheme, colourSchemeEnabled: boolean): string => {
  if (!colourSchemeEnabled) return "dark:bg-gray-800 dark:text-white"; // If gradient is not enabled, return no colour

  // Overdue tasks should have a distinct colour (red)
  if (priority === 11) return colourScheme.overdue; // Red for overdue tasks

  // Gradient logic for priority levels
  if (priority <= 3) {
    return colourScheme.lowPriority; // Low priority (Green)
  } else if (priority <= 7) {
    return colourScheme.mediumPriority; // Medium priority (Yellow)
  } else {
    return colourScheme.highPriority; // High priority (Red)
  }
};

// Modify sorting logic based on the selected sortBy prop
const getSortedTasks = (tasks: (Task & { priority: number })[], sortBy: string) => {
  return [...tasks].sort((a, b) => {
    if (sortBy === "priority") {
      return b.priority - a.priority;
    }

    if (sortBy === "dueDate") {
      const dueDateA = a.due_date ? new Date(a.due_date) : new Date(8640000000000000);
      const dueDateB = b.due_date ? new Date(b.due_date) : new Date(8640000000000000);

      // Overdue tasks should appear first
      if (a.priority === 11 && b.priority !== 11) return -1;
      if (b.priority === 11 && a.priority !== 11) return 1;

      return dueDateA.getTime() - dueDateB.getTime();
    }

    return 0;
  });
};

const getOrdinalSuffix = (num: number): string => {
  if (num % 100 >= 11 && num % 100 <= 13) {
    return `${num}th`; // Special case for 11th, 12th, 13th
  }
  switch (num % 10) {
    case 1: return `${num}st`;
    case 2: return `${num}nd`;
    case 3: return `${num}rd`;
    default: return `${num}th`;
  }
};

const getSortedSubtasks = (subtasks: Subtask[]) => {
  return [...subtasks].sort((a, b) => {
    // If both have valid orders, sort by order (ascending)
    if (a.order !== null && b.order !== null) {
      return a.order - b.order;
    }
    
    // If only one has a valid order, prioritize it
    if (a.order === null && b.order !== null) return 1;
    if (b.order === null && a.order !== null) return -1;

    // If both have null orders, sort by importance_factor (descending)
    return (b?.importance_factor ?? 5) - (a?.importance_factor ?? 5);
  });
};


// Modify filtering logic to consider completed tasks visibility
// Filters tasks based on selected filters.
const getFilteredTasks = (
  tasks: (Task & { priority: number })[],
  selectedFilter: Filter,
  showCompletedTasks: boolean
) => {
  let filteredTasks = showCompletedTasks ? tasks : tasks.filter((task) => !task.completed);

  const { filter, minPriority, maxPriority, selectedCategories } = selectedFilter;

  if (filter === "priorityRange") {
    filteredTasks = filteredTasks.filter((task) => task.priority >= minPriority && task.priority <= maxPriority);
  }

  if (filter === "thisWeek") {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)

    filteredTasks = filteredTasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDueDate = new Date(task.due_date);
      return taskDueDate >= weekStart && taskDueDate <= weekEnd;
    });
  }

  if (filter === "Priority>7") {
    filteredTasks = filteredTasks.filter((task) => task.priority > 7);
  }

  if (filter === "overDue") {
    const now = new Date();
    filteredTasks = filteredTasks.filter((task) => task.due_date && new Date(task.due_date) < now && !task.completed);
  }

  if (filter === "highPriority") {
    filteredTasks = [...filteredTasks].sort((a, b) => b.priority - a.priority).slice(0, 5);
  }

  if (selectedCategories.length > 0) {
    filteredTasks = filteredTasks.filter((task) => selectedCategories.includes(task.category_id ?? -1));
  }

  return filteredTasks;
};


// Function to get category name from category ID
const getCategoryName = (categoryId: number | null, categories: Category[]) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : "Uncategorized";
};

// Helper function to normalize priorities
const normalizePriorities = (tasks: Task[]): (Task & { priority: number })[] => {
  const tasksWithPriorities = tasks.map(task => ({
    ...task,
    priority: calculatePriority(task),
  }));

  const maxPriority = Math.max(...tasksWithPriorities.filter(t => t.priority !== 11).map(t => t.priority), 1);

  return tasksWithPriorities.map(task => ({
    ...task,
    priority: task.priority === 11 ? 11 : parseFloat(((task.priority / maxPriority) * 10).toFixed(2)),
  }));
};





const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  visibleColumns = DEFAULT_COLUMNS,
  selectedFilter,
  showCompletedTasks = false,
  emptyStateMessage,
  sortBy,
  renderActions,
  colourScheme,
  colourSchemeEnabled,
  categories,
  subtasks,
}) => {
  
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());

  const toggleTask = (taskId: number) => {
    setExpandedTasks((prev) => {
      const newExpandedTasks = new Set(prev);
      if (newExpandedTasks.has(taskId)) {
        newExpandedTasks.delete(taskId);
      } else {
        newExpandedTasks.add(taskId);
      }
      return newExpandedTasks;
    });
  };
  

  const normalizedTasks = normalizePriorities(tasks);

  // Apply filtering, including completed tasks visibility
  const filteredTasks = getFilteredTasks(normalizedTasks, selectedFilter, showCompletedTasks);
  if (filteredTasks.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-100 rounded-lg shadow-md mt-4 dark:bg-gray-700">
        {emptyStateMessage || (
          <>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No tasks at the moment!</p>
            <p className="text-gray-500 dark:text-gray-400">Start by adding some tasks to stay organized.</p>
          </>
        )}
      </div>
    );
  }
  const sortedTasks = getSortedTasks(filteredTasks, sortBy);
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg mt-4 w-full dark:bg-gray-900">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr className="bg-gray-200 dark:bg-gray-700">
            {visibleColumns.includes("title") && <th className="py-2 px-4 text-left">Task Title</th>}
            {visibleColumns.includes("priority") && <th className="py-2 px-4 text-left">Priority</th>}
            {visibleColumns.includes("due_date") && <th className="py-2 px-4 text-left">Due Date</th>}
            {visibleColumns.includes("category") && <th className="py-2 px-4 text-left">Category</th>}
            {visibleColumns.includes("duration") && <th className="py-2 px-4 text-left">Duration</th>}
            {renderActions && <th className="py-2 px-4 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody className="text-black dark:text-black divide-y divide-gray-300">
          {sortedTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              subtasks={subtasks?.filter((subtask) => subtask.task_id === task.id)}
              visibleColumns={visibleColumns}
              toggleTask={toggleTask}
              expanded={expandedTasks.has(task.id)}
              renderActions={renderActions}
              colourScheme={colourScheme}
              colourSchemeEnabled={colourSchemeEnabled}
              categories={categories}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};


const TaskRow: React.FC<TaskRowProps> = ({
  task,
  toggleTask,
  expanded,
  subtasks,
  colourScheme,
  colourSchemeEnabled,
  visibleColumns = DEFAULT_COLUMNS,
  renderActions,
  categories
}) => {
  const sortedSubtasks = subtasks? getSortedSubtasks(subtasks) : [];
  const priority = calculatePriority(task);
  const prioritycolour = getPrioritycolour(priority, colourScheme, colourSchemeEnabled);
  const orderedSubtasks = sortedSubtasks.filter((subtask) => subtask.order !== null);
  const unorderedSubtasks = sortedSubtasks.filter((subtask) => subtask.order === null);

  return (
    <>
        <tr
          className={`${prioritycolour}`}
          onClick={(e) => {
            // Prevent toggle when clicking inside the Actions column
            if ((e.target as HTMLElement).closest(".task-actions")) return;
            toggleTask(task.id);
          }}
          style={{ cursor: "pointer" }}
          >
        {visibleColumns.includes("title") && (
          <td className={`py-2 px-4 ${task.completed ? "line-through text-gray-400" : ""}`}>
            {task.title || "Untitled Task"}
          </td>
        )}
        {visibleColumns.includes("priority") && <td className="py-2 px-4">{priority.toFixed(2)}</td>}
        {visibleColumns.includes("due_date") && <td className="py-2 px-4">{renderDueDate(task.due_date)}</td>}
        {visibleColumns.includes("category") && <td className="py-2 px-4">{getCategoryName(task.category_id, categories)}</td>}
        {visibleColumns.includes("duration") && <td className="py-2 px-4">{renderDuration(task.duration)}</td>}
        {renderActions && <td className="py-2 px-4 task-actions">{renderActions(task)}</td>}
      </tr>

      {expanded==true && subtasks &&(
        <>
          {orderedSubtasks.length > 0 && (
            <>
              <SubtaskTable
                subtasks={orderedSubtasks}
                visibleColumns={visibleColumns}
                renderDuration={renderDuration}
                taskPrioritycolour={prioritycolour}
                getPrioritycolour={getPrioritycolour}
                colourScheme={colourScheme}
                colourSchemeEnabled={colourSchemeEnabled}
              />
            </>
          )}

          {unorderedSubtasks.length > 0 && (
            <>
              <SubtaskTable
                subtasks={unorderedSubtasks}
                visibleColumns={visibleColumns}
                renderDuration={renderDuration}
                getPrioritycolour={getPrioritycolour}
                taskPrioritycolour={prioritycolour}
                colourScheme={colourScheme}
                colourSchemeEnabled={colourSchemeEnabled}
              />
            </>
          )}

        {orderedSubtasks.length === 0 && unorderedSubtasks.length === 0 && (
        <tr className="dark:bg-gray-700 dark:text-white">
          <td colSpan={visibleColumns.length} className="text-center p-4">
            No subtasks available
          </td>
        </tr>
            )}
        </>
      )}
    </>
  );
};


const SubtaskTable: React.FC<{
  subtasks: Subtask[];
  visibleColumns: string[];
  renderDuration: (duration: number) => string;
  getPrioritycolour: (priority: number, colourScheme: ColourScheme, colourSchemeEnabled: boolean) => string;
  colourScheme: ColourScheme;
  colourSchemeEnabled: boolean;
  taskPrioritycolour: string;
}> = ({ subtasks, visibleColumns, getPrioritycolour, colourScheme, colourSchemeEnabled, taskPrioritycolour }) => {
  // Count how many columns are visible

  return(
  <>
  <tr className={`${taskPrioritycolour}`}>
  <td colSpan={visibleColumns.length} className="p-0">
    <div className="p-4">
      <div className="overflow-hidden rounded-lg border-2 border-gray-600">
      <table className="w-full table-auto ml-auto rounded-lg border-collapse">
        {/* Table Head */}
        <thead className="bg-gray-100 rounded-lg">
          <tr className="dark:bg-gray-700 dark:text-white">
            <th colSpan={visibleColumns.length} className="py-1 px-4 font-bold">
            {subtasks.some((subtask) => subtask.order !== null) ? "Ordered Subtasks" : "Unordered Subtasks"}
            </th>
          </tr>
          <tr className="dark:bg-gray-700 dark:text-white">
            {visibleColumns.includes("order") && <th className="px-4 text-left w-16 pl-10">Order</th>}
            {visibleColumns.includes("title") && <th className="py-2 px-4 text-left  ">Subtask Title</th>}
            {visibleColumns.includes("priority") && <th className="py-2 px-4 text-left  ">Priority</th>}
            {visibleColumns.includes("duration") && <th className="py-2 px-4 text-left  ">Duration</th>}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="border-t border-gray-600">
          {subtasks.map((subtask) => (
            <tr key={subtask.id} className={`  ${getPrioritycolour(subtask.importance_factor ?? 5, colourScheme, colourSchemeEnabled)}`}>
              {visibleColumns.includes("order") ? (
                <td className="py-2 px-4 w-16 pl-10  ">
                  {subtask.order !== null ? getOrdinalSuffix(subtask.order) : "-"}
                </td>
              ) : null}
              {visibleColumns.includes("title") && <td className="py-2 px-4 ">{subtask.title || "Untitled Subtask"}</td>}
              {visibleColumns.includes("priority") && <td className="py-2 px-4">{(subtask.importance_factor ?? 5).toFixed(2)}</td>}
              {visibleColumns.includes("duration") && <td className="py-2 px-4 ">{renderDuration(subtask.duration)}</td>}
            </tr>
          ))}
        </tbody>

      </table>
      </div>
    </div>
  </td>
</tr>

  </>
);
};

export default TaskTable;
