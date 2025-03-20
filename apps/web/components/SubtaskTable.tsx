import { ColourScheme } from "@GlobalTypes/ColourScheme";
import { Subtask } from "@GlobalTypes/Task";
import { getOrdinalSuffix, renderDuration } from "@Utils/TaskTableUtils";

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

export default SubtaskTable;