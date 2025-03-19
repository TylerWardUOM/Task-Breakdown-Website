import { forwardRef, useImperativeHandle } from "react";
import { Subtask } from "@GlobalTypes/Task";
import { TaskBreakdownResponse } from "@FrontendTypes/AiResponse";
import useSubtasks from "@Hooks/useSubtasks";

interface SubtaskModalProps {
  existing_subtasks?: Subtask[] | null;
  response?: TaskBreakdownResponse | null;
}

const SubtaskModal = forwardRef(({ existing_subtasks, response }: SubtaskModalProps, ref) => {
  const {
    getSubtasks, // Added localSubtasks reference for useImperativeHandle
    orderedSubtasks,
    unorderedSubtasks,
    updateSubtaskField,
    deleteSubtask,
    addSubtask,
    moveSubtaskBetweenSections,
    changeSubtaskOrder,
    findMaxOrder,
  } = useSubtasks({ existing_subtasks, response });

  // **Expose function to get subtasks**
  useImperativeHandle(ref, () => ({
    getSubtasks,
  }));

    return (
      <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-700 dark:border dark:border-gray-600 mt-2">
      <h4 className="font-semibold text-gray-900 dark:text-white">Subtasks</h4>
      <div className="space-y-3">
      {orderedSubtasks.map((localSubtask) => (
          <div key={localSubtask.uuid} className="p-3 bg-gray-50 rounded-lg border relative dark:bg-gray-800 dark:border-gray-700">
            <button className="p-3" onClick={() => changeSubtaskOrder(localSubtask.uuid, "up")}>⬆</button>
            <button onClick={() => changeSubtaskOrder(localSubtask.uuid, "down")}>⬇</button>
            <button onClick={() => moveSubtaskBetweenSections(localSubtask.uuid)}>Move to Unordered</button>
            <button
              onClick={() => deleteSubtask(localSubtask.uuid)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
            >
              ✕
            </button>

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
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
            </select>
          </div>
      ))}
      <button
        onClick={() => addSubtask(findMaxOrder())}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
        Add Subtask to Ordered
      </button>
      {unorderedSubtasks.map(({ uuid, subtask }) => (
          <div key={uuid} className="p-3 bg-gray-50 rounded-lg border relative dark:bg-gray-800 dark:border-gray-700">
            <button onClick={() => moveSubtaskBetweenSections(uuid)}>Move to Ordered</button>
            <button
              onClick={() => deleteSubtask(uuid)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
            >
              ✕
            </button>

            <input
              type="text"
              className="w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
              value={subtask.title}
              onChange={(e) => updateSubtaskField(uuid, "title", e.target.value)}
              placeholder="Enter subtask title..."
            />
            <textarea
              className="w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 mt-2"
              value={subtask.description || ""}
              onChange={(e) => updateSubtaskField(uuid, "description", e.target.value || null)}
              placeholder="Enter subtask description..."
              rows={2}
            />

            {/* Duration */}
            <div className="flex items-center space-x-2 mt-2">
              <label className="text-sm text-gray-600 dark:text-gray-300">Duration:</label>
              <input
                type="number"
                className="p-1 border rounded w-16 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
                value={subtask.duration ?? ""}
                onChange={(e) =>
                  updateSubtaskField(uuid, "duration", e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Mins"
              />
            </div>

            {/* Importance Factor */}
            <label htmlFor="Importance Factor" className="text-sm text-gray-600 dark:text-gray-300">Importance:</label>
            <select
              id="Importance Factor"
              className="p-1 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
              value={subtask.importance_factor ?? ""}
              onChange={(e) => updateSubtaskField(uuid, "importance_factor", Number(e.target.value))}
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
            </select>
          </div>
        ))}
        <button
        onClick={() => addSubtask(null)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
        Add Subtask to UnOrdered
      </button>
      </div>
    </div>
    )
  });


SubtaskModal.displayName = "SubtaskModal";
export default SubtaskModal;
