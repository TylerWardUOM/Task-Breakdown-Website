import { Subtask_data } from "@GlobalTypes/Task";
import useSubtaskModal from "@Hooks/useSubtaskModal";

// ✅ SubtaskList Component
interface SubtaskListProps {
  subtasks: ReturnType<typeof useSubtaskModal>["orderedSubtasks"];
  isOrdered: boolean;
  updateSubtaskField: (uuid: string, field: keyof Subtask_data, value: unknown) => void;
  deleteSubtask: (uuid: string) => void;
  moveSubtaskBetweenSections: (uuid: string) => void;
  changeSubtaskOrder: (uuid: string, direction: "up" | "down") => void;
}

const SubtaskModalList = ({
  subtasks,
  isOrdered,
  updateSubtaskField,
  deleteSubtask,
  moveSubtaskBetweenSections,
  changeSubtaskOrder,
}: SubtaskListProps) => {
  return (
    <>
      {subtasks.map((localSubtask) => (
        <div key={localSubtask.uuid} className="p-3 bg-gray-50 rounded-lg border relative dark:bg-gray-800 dark:border-gray-700">
          {/* Order Change Buttons (Only for Ordered) */}
          {isOrdered && (
            <>
              <button className="p-3" onClick={() => changeSubtaskOrder(localSubtask.uuid, "up")}>⬆</button>
              <button onClick={() => changeSubtaskOrder(localSubtask.uuid, "down")}>⬇</button>
            </>
          )}

          {/* Move Between Sections */}
          <button onClick={() => moveSubtaskBetweenSections(localSubtask.uuid)}>
            Move to {isOrdered ? "Unordered" : "Ordered"}
          </button>

          {/* Delete Button */}
          <button
            onClick={() => deleteSubtask(localSubtask.uuid)}
            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
          >
            ✕
          </button>

          {/* Subtask Fields */}
          <input
            type="text"
            className="w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
            value={localSubtask.subtask.title}
            onChange={(e) => updateSubtaskField(localSubtask.uuid, "title", e.target.value)}
            placeholder="Enter subtask title..."
          />
          <textarea
            className="w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 mt-2"
            value={localSubtask.subtask.description || ""}
            onChange={(e) => updateSubtaskField(localSubtask.uuid, "description", e.target.value || null)}
            placeholder="Enter subtask description..."
            rows={2}
          />

          {/* Duration */}
          <div className="flex items-center space-x-2 mt-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">Duration:</label>
            <input
              type="number"
              className="p-1 border rounded w-16 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
              value={localSubtask.subtask.duration ?? ""}
              onChange={(e) =>
                updateSubtaskField(localSubtask.uuid, "duration", e.target.value ? Number(e.target.value) : null)
              }
              placeholder="Mins"
            />
          </div>

          {/* Importance Factor */}
          <label htmlFor="Importance Factor" className="text-sm text-gray-600 dark:text-gray-300">Importance:</label>
          <select
            id="Importance Factor"
            className="p-1 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
            value={localSubtask.subtask.importance_factor ?? ""}
            onChange={(e) => updateSubtaskField(localSubtask.uuid, "importance_factor", Number(e.target.value))}
            >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                {num}
                </option>
            ))}
            </select>
        </div>
      ))}
    </>
  );
};

export default SubtaskModalList;
