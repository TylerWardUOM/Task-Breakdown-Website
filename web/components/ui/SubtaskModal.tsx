import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Subtask, Subtask_data, TaskBreakdownResponse} from "../../types/Task";
import { v4 as uuidv4 } from 'uuid';


// Define the props structure for TaskForm
interface SubtaskModalProps {
    existing_subtasks?: Subtask[]| null| [];
    response?: TaskBreakdownResponse | null
  }

  type LocalSubtask = {
    uuid: string; // Temporary unique ID for React rendering
    subtask: Subtask_data
  };

  const SubtaskModal = forwardRef(({ existing_subtasks, response }: SubtaskModalProps, ref) => {

      // Convert AI duration to minutes
    const convertToMinutes = (duration: { hours: number; minutes: number } | null): number | null =>
        duration ? duration.hours * 60 + duration.minutes : null;

    const [localSubtasks, setLocalSubtasks] = useState<LocalSubtask[]>([]);

    useEffect(() => {
        let newLocalSubtasks: LocalSubtask[] = [];
        let existingLocalSubtasks: LocalSubtask[] = [];

        if (response && response.subtasks) {
            newLocalSubtasks = response.subtasks.map((subtask) => ({
                uuid: uuidv4(), // Temporary unique ID for React rendering
                subtask: {
                    subtaskId: undefined,
                    title: subtask.title,
                    description: subtask.description,
                    duration: convertToMinutes(subtask.duration),
                    importance_factor: subtask.importance_factor,
                    order: subtask.order ?? null,
                    is_deleted: subtask.is_deleted ?? undefined,
                    
                },
            }));
        }

        if (existing_subtasks) {
            existingLocalSubtasks = existing_subtasks.map((subtask) => ({
                uuid: uuidv4(), // Temporary unique ID for React rendering
                subtask: {
                    subtaskId: subtask.id,
                    title: subtask.title,
                    description: subtask.description,
                    duration: subtask.duration,
                    importance_factor: subtask.importance_factor,
                    order: subtask.order ?? null,
                    is_deleted: subtask.is_deleted ?? undefined,
                },
            }));
        }

        setLocalSubtasks([...newLocalSubtasks, ...existingLocalSubtasks]);
    }, [response, existing_subtasks]); // Runs when `response` or `existing_subtasks` change

    // Update Subtask Field
    const updateSubtaskField = (uuid: string, field: keyof Subtask_data, value: unknown) => {
        setLocalSubtasks((prevSubtasks) =>
        prevSubtasks.map((subtask) =>
            subtask.uuid === uuid ? { ...subtask, subtask: { ...subtask.subtask, [field]: value } } // ✅ Correctly update `subtask.subtask`
        : subtask
        )
        );
    };
    
    // Delete Subtask
    const deleteSubtask = (uuid: string) => {
        setLocalSubtasks((prevSubtasks) =>
            prevSubtasks.map((subtask) =>
                subtask.uuid === uuid
                    ? { ...subtask, subtask: { ...subtask.subtask, is_deleted: true } } // Mark as deleted
                    : subtask
            )
        );
    };
    

    const moveSubtaskBetweenSections = (uuid: string) => {
        setLocalSubtasks((prev) => {
          let updatedSubtasks = [...prev];
          const subtaskIndex = updatedSubtasks.findIndex((entry) => entry.uuid === uuid);
          if (subtaskIndex === -1) return prev;
      
          const subtask = updatedSubtasks[subtaskIndex].subtask;
      
          if (subtask.order === null) {
            // Moving to ordered: Assign last available order
            const orderedSubtasks = updatedSubtasks.filter((s) => s.subtask.order !== null);
            const maxOrder = orderedSubtasks.length > 0 ? Math.max(...orderedSubtasks.map((s) => s.subtask.order ?? 0)) : 0;
            updatedSubtasks[subtaskIndex] = { ...updatedSubtasks[subtaskIndex], subtask: { ...subtask, order: maxOrder + 1 } };
          } else {
            // Moving to unordered: Remove order
            updatedSubtasks[subtaskIndex] = { ...updatedSubtasks[subtaskIndex], subtask: { ...subtask, order: null } };
      
            // Reorder ordered tasks sequentially
            const orderedTasks = updatedSubtasks
              .filter((s) => s.subtask.order !== null)
              .sort((a, b) => (a.subtask.order ?? 0) - (b.subtask.order ?? 0))
              .map((task, i) => ({ ...task, subtask: { ...task.subtask, order: i + 1 } }));
      
            // Merge updated ordered list back into the full list
            updatedSubtasks = updatedSubtasks.map((s) => orderedTasks.find((ordered) => ordered.uuid === s.uuid) || s);
          }
      
          return updatedSubtasks;
        });
      };
      
      const changeSubtaskOrder = (uuid: string, direction: "up" | "down") => {
        setLocalSubtasks((prev) => {
          // Clone the array to avoid mutating state directly
          const updatedSubtasks = [...prev];
      
          // Find the target subtask
          const subtaskEntry = updatedSubtasks.find((s) => s.uuid === uuid);
          if (!subtaskEntry || subtaskEntry.subtask.order == null) return prev; // Ensure valid subtask
      
          const currentOrder = subtaskEntry.subtask.order;
          const swapOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
      
          // Find the subtask with the swap order
          const swapIndex = updatedSubtasks.findIndex((s) => s.subtask.order === swapOrder);
          if (swapIndex === -1) return prev; // Ensure valid swap target
      
          const targetIndex = updatedSubtasks.findIndex((s) => s.uuid === uuid);
      
          // Swap the order values in the main list
          updatedSubtasks[targetIndex] = {
            ...updatedSubtasks[targetIndex],
            subtask: { ...updatedSubtasks[targetIndex].subtask, order: swapOrder },
          };
      
          updatedSubtasks[swapIndex] = {
            ...updatedSubtasks[swapIndex],
            subtask: { ...updatedSubtasks[swapIndex].subtask, order: currentOrder },
          };
      
          // Return the updated array to trigger a re-render
          return updatedSubtasks;
        });
      };
      
      
      
      const notDeletedSubtasks = localSubtasks.filter((entry) => entry.subtask.is_deleted != true);
      // Derived ordered and unordered lists
      const orderedSubtasks = notDeletedSubtasks
        .filter((entry) => entry.subtask.order !== null)
        .sort((a, b) => (a.subtask.order ?? 0) - (b.subtask.order ?? 0));
      
      const unorderedSubtasks = notDeletedSubtasks.filter((entry) => entry.subtask.order === null);

       // **Expose function to get subtasks**
       useImperativeHandle(ref, () => ({
        getSubtasks: (): Subtask_data[] =>
          localSubtasks.map(({ subtask }) => ({
            subtaskId: subtask.subtaskId ?? undefined, // Ensure optional subtaskId
            title: subtask.title,
            description: subtask.description,
            duration: subtask.duration,
            importance_factor: subtask.importance_factor,
            order: subtask.order,
            is_deleted: subtask.is_deleted ?? undefined,
          })),
      }));
      


    return(
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
      </div>
    </div>
    )
  });

SubtaskModal.displayName = "SubtaskModal"; // ✅ Add display name
export default SubtaskModal;