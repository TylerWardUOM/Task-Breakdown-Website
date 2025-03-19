"use client";
import React, { useState } from "react";
import { Filter } from "@FrontendTypes/filter";
import { Category } from "@GlobalTypes/Category";
import { ColourScheme } from "@GlobalTypes/ColourScheme";
import { Task, Subtask } from "@GlobalTypes/Task";
import { calculatePriority } from "@lib/calculatePriority";
import { normalizePriorities, getFilteredTasks, getSortedTasks, 
  getSortedSubtasks, getPrioritycolour, renderDueDate, getCategoryName, 
  renderDuration, getOrdinalSuffix } from "@Utils/TaskTableUtils";


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
