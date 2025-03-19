import { useEffect, useState } from "react";
import { Subtask, Subtask_data } from "@GlobalTypes/Task";
import { mapExistingSubtasks, mapResponseSubtasks } from "@Utils/subtaskUtils";
import { TaskBreakdownResponse } from "@FrontendTypes/AiResponse";

// Define the props for initialization
interface UseSubtasksProps {
  existing_subtasks?: Subtask[] | null;
  response?: TaskBreakdownResponse | null;
}

// Type for local subtask state
type LocalSubtask = {
  uuid: string; // Temporary unique ID for React rendering
  subtask: Subtask_data;
};

// Custom Hook
const useSubtasks = ({ existing_subtasks, response }: UseSubtasksProps) => {
  const [localSubtasks, setLocalSubtasks] = useState<LocalSubtask[]>([]);

  // Initialize or update local subtasks when props change
  useEffect(() => {
    let newLocalSubtasks: LocalSubtask[] = [];
    let existingLocalSubtasks: LocalSubtask[] = [];

    // Convert response subtasks
    if (response?.subtasks) {
        newLocalSubtasks = mapResponseSubtasks(response);
    }

    // Convert existing subtasks
    if (existing_subtasks) {
        existingLocalSubtasks = mapExistingSubtasks(existing_subtasks);
    }

    // Merge new and existing subtasks
    setLocalSubtasks([...newLocalSubtasks, ...existingLocalSubtasks]);
  }, [response, existing_subtasks]);

  // ✅ Update Subtask Field
  const updateSubtaskField = (uuid: string, field: keyof Subtask_data, value: unknown) => {
    setLocalSubtasks((prevSubtasks) =>
      prevSubtasks.map((subtask) =>
        subtask.uuid === uuid ? { ...subtask, subtask: { ...subtask.subtask, [field]: value } } : subtask
      )
    );
  };

  // ✅ Delete Subtask (Soft Delete)
  const deleteSubtask = (uuid: string) => {
    setLocalSubtasks((prevSubtasks) =>
      prevSubtasks.map((subtask) =>
        subtask.uuid === uuid ? { ...subtask, subtask: { ...subtask.subtask, is_deleted: true } } : subtask
      )
    );
  };

  // ✅ Move Subtask Between Ordered and Unordered
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

        // Reorder remaining ordered subtasks sequentially
        const orderedTasks = updatedSubtasks
          .filter((s) => s.subtask.order !== null)
          .sort((a, b) => (a.subtask.order ?? 0) - (b.subtask.order ?? 0))
          .map((task, i) => ({ ...task, subtask: { ...task.subtask, order: i + 1 } }));

        // Merge back into main list
        updatedSubtasks = updatedSubtasks.map((s) => orderedTasks.find((ordered) => ordered.uuid === s.uuid) || s);
      }

      return updatedSubtasks;
    });
  };

  // ✅ Change Subtask Order (Move Up/Down)
  const changeSubtaskOrder = (uuid: string, direction: "up" | "down") => {
    setLocalSubtasks((prev) => {
      const updatedSubtasks = [...prev];

      // Find target subtask
      const subtaskEntry = updatedSubtasks.find((s) => s.uuid === uuid);
      if (!subtaskEntry || subtaskEntry.subtask.order == null) return prev;

      const currentOrder = subtaskEntry.subtask.order;
      const swapOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;

      // Find the subtask with the swap order
      const swapIndex = updatedSubtasks.findIndex((s) => s.subtask.order === swapOrder);
      if (swapIndex === -1) return prev;

      const targetIndex = updatedSubtasks.findIndex((s) => s.uuid === uuid);

      // Swap orders
      updatedSubtasks[targetIndex] = {
        ...updatedSubtasks[targetIndex],
        subtask: { ...updatedSubtasks[targetIndex].subtask, order: swapOrder },
      };

      updatedSubtasks[swapIndex] = {
        ...updatedSubtasks[swapIndex],
        subtask: { ...updatedSubtasks[swapIndex].subtask, order: currentOrder },
      };

      return updatedSubtasks;
    });
  };

  // ✅ Filter out deleted subtasks
  const notDeletedSubtasks = localSubtasks.filter((entry) => entry.subtask.is_deleted !== true);

  // ✅ Separate ordered and unordered subtasks
  const orderedSubtasks = notDeletedSubtasks
    .filter((entry) => entry.subtask.order !== null)
    .sort((a, b) => (a.subtask.order ?? 0) - (b.subtask.order ?? 0));

  const unorderedSubtasks = notDeletedSubtasks.filter((entry) => entry.subtask.order === null);

  return {
    localSubtasks,
    orderedSubtasks,
    unorderedSubtasks,
    updateSubtaskField,
    deleteSubtask,
    moveSubtaskBetweenSections,
    changeSubtaskOrder,
  };
};

export default useSubtasks;
