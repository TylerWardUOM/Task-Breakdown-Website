"use client";
import React from "react";
import { Filter } from "@FrontendTypes/filter";
import { Category } from "@GlobalTypes/Category";
import { ColourScheme } from "@GlobalTypes/ColourScheme";
import { Task, Subtask } from "@GlobalTypes/Task";
import { normalizePriorities, getFilteredTasks, getSortedTasks} from "@Utils/TaskTableUtils";
import TaskRow from "./TaskRow";


interface TaskTableProps {
  tasks: Task[];
  categories: Category[]; // Added categories prop
  selectedFilter: Filter
  sortBy: string; // Sort by priority, due date, etc.
  onEdit?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  onFocus?: (taskId: number) => void;
  // @ts-expect-error: Ignoring error because JSX is properly handled in this project
  renderActions?: (task: Task) => JSX.Element;
  // @ts-expect-error: Ignoring error because JSX is properly handled in this project
  renderSubtaskActions?: (subtask: Subtask) => JSX.Element; // New prop for actions
  colourScheme: ColourScheme;       // New prop for custom colour schemes
  colourSchemeEnabled: boolean;    // New prop to toggle the colour gradient
  showCompletedTasks?: boolean; // New optional prop
  emptyStateMessage?: React.ReactNode;
  visibleColumns?: string[]; 
  subtasks?: Subtask[]; 
  disableSubtaskToggle?: boolean; 
}



const DEFAULT_COLUMNS = ["title", "priority", "due_date", "category", "duration", "order","progress"];



const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  visibleColumns = DEFAULT_COLUMNS,
  selectedFilter,
  showCompletedTasks = false,
  emptyStateMessage,
  sortBy,
  renderActions,
  renderSubtaskActions,
  colourScheme,
  colourSchemeEnabled,
  categories,
  subtasks,
  disableSubtaskToggle,
}) => {
  

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
    <div className="overflow-x-auto bg-gray-100 shadow-md rounded-lg mt-4 w-full">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100 dark:bg-gray-900">
          <tr className="bg-gray-200 dark:bg-gray-700">
            {visibleColumns.includes("title") && <th className="py-2 px-4 text-left">Task Title</th>}
            {visibleColumns.includes("priority") && <th className="py-2 px-4 text-left">Priority</th>}
            {visibleColumns.includes("due_date") && <th className="py-2 px-4 text-left">Due Date</th>}
            {visibleColumns.includes("category") && <th className="py-2 px-4 text-left">Category</th>}
            {visibleColumns.includes("duration") && <th className="py-2 px-4 text-left">Duration</th>}
            {visibleColumns.includes("progress") && <th className="py-2 px-4 text-left">Progress</th>}
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
              renderActions={renderActions}
              colourScheme={colourScheme}
              colourSchemeEnabled={colourSchemeEnabled}
              categories={categories}
              renderSubtaskActions={renderSubtaskActions}
              disableSubtaskToggle={disableSubtaskToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default TaskTable;
