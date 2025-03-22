import { Category } from "@GlobalTypes/Category";
import { ColourScheme } from "@GlobalTypes/ColourScheme";
import { Task, Subtask } from "@GlobalTypes/Task";
import { calculatePriority } from "@lib/calculatePriority";
import { getSortedSubtasks, getPrioritycolour, renderDueDate, getCategoryName, renderDuration } from "@Utils/TaskTableUtils";
import SubtaskTable from "./SubtaskTable"
import { useTaskRow } from "@Hooks/useTaskRow";
import clsx from "clsx"; // Ensure you have clsx installed
import { CheckCircleIcon } from "@heroicons/react/solid";

interface TaskRowProps{
    task: Task;
    subtasks?: Subtask[];
    visibleColumns?: string[]; 
    colourScheme: ColourScheme;       // New prop for custom colour schemes
    colourSchemeEnabled: boolean;
      // @ts-expect-error: Ignoring error because JSX is properly handled in this project
    renderActions?: (task: Task) => JSX.Element;
    categories: Category[];
  }


const DEFAULT_COLUMNS = ["title", "priority", "due_date", "category", "duration", "order","progress"];



const TaskRow: React.FC<TaskRowProps> = ({
    task,
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
    const totalSubtaskCount = sortedSubtasks.length;
    const completedSubtaskCount = sortedSubtasks.filter((subtask) => subtask.completed == true).length;
    const progress = totalSubtaskCount > 0 ? (completedSubtaskCount / totalSubtaskCount) * 100 : task.completed ? 100 : 0;
    const {expanded,toggleTask} = useTaskRow()
  
    return (
      <>
          <tr
            className={`${prioritycolour}`}
            onClick={(e) => {
              // Prevent toggle when clicking inside the Actions column
              if ((e.target as HTMLElement).closest(".task-actions")) return;
              toggleTask();
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

          {/* Progress Column */}
          {visibleColumns.includes("progress") && (
            <td className="py-2 px-4">
              {totalSubtaskCount > 0 ? (
                <div className="relative w-32 h-4 bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div
                    className={clsx(
                      "h-full bg-green-500 transition-all ease-in-out duration-300",
                      {
                        "w-0": progress === 0,
                        "w-1/4": progress > 0 && progress <= 25,
                        "w-1/2": progress > 25 && progress <= 50,
                        "w-3/4": progress > 50 && progress <= 75,
                        "w-full": progress > 75,
                      }
                    )}
                    aria-label={`Task progress: ${progress.toFixed(0)}%`}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white dark:text-black">
                    {progress.toFixed(0)}%
                  </span>
                </div>
              ) : (
                task.completed ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <span className="text-gray-500">No Subtasks</span>
                )
              )}
            </td>
          )}

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

export default TaskRow;