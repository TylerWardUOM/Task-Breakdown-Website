import { Category } from "@GlobalTypes/Category";
import { ColourScheme } from "@GlobalTypes/ColourScheme";
import { Task, Subtask } from "@GlobalTypes/Task";
import { getSortedSubtasks, getPrioritycolour, renderDueDate, getCategoryName, renderDuration } from "@Utils/TaskTableUtils";
import SubtaskTable from "./SubtaskTable"
import { useTaskRow } from "@Hooks/useTaskRow";
import { CheckCircleIcon } from "@heroicons/react/solid";
import ProgressBar from "./TaskInfo/ProgressBar";

interface TaskRowProps{
    task: Task & { priority: number };
    subtasks?: Subtask[];
    visibleColumns?: string[]; 
    colourScheme: ColourScheme;       // New prop for custom colour schemes
    colourSchemeEnabled: boolean;
      // @ts-expect-error: Ignoring error because JSX is properly handled in this project
    renderActions?: (task: Task) => JSX.Element;
    // @ts-expect-error: Ignoring error because JSX is properly handled in this project
    renderSubtaskActions?: (subtask: Subtask) => JSX.Element; // New prop for actions
    categories: Category[];
    disableSubtaskToggle?: boolean; 
  }


const DEFAULT_COLUMNS = ["title", "priority", "due_date", "category", "duration", "order","progress"];



const TaskRow: React.FC<TaskRowProps> = ({
    task,
    subtasks,
    colourScheme,
    colourSchemeEnabled,
    visibleColumns = DEFAULT_COLUMNS,
    renderActions,
    renderSubtaskActions,
    categories,
    disableSubtaskToggle = true, // Default: allow toggling
  }) => {
    const sortedSubtasks = subtasks? getSortedSubtasks(subtasks) : [];
    const prioritycolour = getPrioritycolour(task.priority, colourScheme, colourSchemeEnabled);
    const orderedSubtasks = sortedSubtasks.filter((subtask) => subtask.order !== null);
    const unorderedSubtasks = sortedSubtasks.filter((subtask) => subtask.order === null);
    const totalSubtaskCount = sortedSubtasks.length;
    const completedSubtaskCount = sortedSubtasks.filter((subtask) => subtask.completed == true).length;
    const progress = totalSubtaskCount > 0 ? (completedSubtaskCount / totalSubtaskCount) * 100 : task.completed ? 100 : 0;
    const {expanded,toggleTask} = useTaskRow()
  
    return (
      <>
          <tr
            className={`${prioritycolour} ${task.completed ? "bg-opacity-50" : ""}`}
            onClick={(e) => {
              if (disableSubtaskToggle) return; // Prevent toggling if disabled
              if ((e.target as HTMLElement).closest(".task-actions")) return;
              toggleTask();
            }}
            style={{ cursor: disableSubtaskToggle ? "default" : "pointer" }}
            >
          {visibleColumns.includes("title") && (
            <td className={`py-2 px-4 ${task.completed ? "line-through opacity-50" : ""}`}>
              {task.title || "Untitled Task"}
            </td>
          )}
          {visibleColumns.includes("priority") && <td className={`py-2 px-4 ${task.completed ? "opacity-50" : ""}`}>{task.priority.toFixed(2)}</td>}
          {visibleColumns.includes("due_date") && <td className={`py-2 px-4 ${task.completed ? "opacity-50" : ""}`}>{renderDueDate(task.due_date)}</td>}
          {visibleColumns.includes("category") && <td className={`py-2 px-4 ${task.completed ? "opacity-50" : ""}`}>{getCategoryName(task.category_id, categories)}</td>}
          {visibleColumns.includes("duration") && <td className={`py-2 px-4 ${task.completed ? "opacity-50" : ""}`}>{renderDuration(task.duration)}</td>}

          {visibleColumns.includes("progress") && (
          <td className={`py-2 px-4 ${task.completed ? "opacity-50" : ""}`}>
            {totalSubtaskCount > 0 ? (
              <ProgressBar progress={progress} />
            ) : task.completed ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <span className="text-gray-500">No Subtasks</span>
            )}
          </td>
        )}


          {renderActions && <td className="py-2 px-4 task-actions">{renderActions(task)}</td>}
        </tr>
  
        {!disableSubtaskToggle && expanded==true && subtasks &&(
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
                  renderSubtaskActions={renderSubtaskActions}
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
                  renderSubtaskActions={renderSubtaskActions}
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