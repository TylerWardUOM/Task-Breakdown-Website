import { Category } from "@GlobalTypes/Category";
import { ColourScheme } from "@GlobalTypes/ColourScheme";
import { Task, Subtask } from "@GlobalTypes/Task";
import { calculatePriority } from "@lib/calculatePriority";
import { getSortedSubtasks, getPrioritycolour, renderDueDate, getCategoryName, renderDuration } from "@Utils/TaskTableUtils";
import SubtaskTable from "./SubtaskTable"
import { useTaskRow } from "@Hooks/useTaskRow";

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


const DEFAULT_COLUMNS = ["title", "priority", "due_date", "category", "duration", "order"];



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