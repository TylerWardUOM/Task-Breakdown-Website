import { useEffect, useState } from "react";
import { Subtask, Subtask_data } from "@GlobalTypes/Task";
import { mapExistingSubtasks, mapResponseSubtasks } from "../utils/subtaskUtils";
import { TaskBreakdownResponse } from "@FrontendTypes/AiResponse";
import {CreateBlankSubtask} from "@Utils/CreateBlankSubtask";
import {LocalSubtask} from "@FrontendTypes/LocalSubtask";

// Define the props for initialization
interface UseSubtasksProps {
  existing_subtasks?: Subtask[] | null;
  response?: TaskBreakdownResponse | null;
}


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

  const deleteSubtask = (uuid: string) => {
    setLocalSubtasks((prevSubtasks) => {
      let deletedSubtask = prevSubtasks.find((subtask) => subtask.uuid === uuid);
      if (!deletedSubtask) return prevSubtasks;
      if (deletedSubtask.temp_order === null) return prevSubtasks;
  
      return prevSubtasks.map((subtask) => {
        if (subtask.uuid === uuid) {
          // Mark as deleted but keep temp_order unchanged
          return { ...subtask, subtask: { ...subtask.subtask, is_deleted: true } };
        }
        if (deletedSubtask.temp_order != null && subtask.temp_order !== null && subtask.temp_order > deletedSubtask.temp_order) {
          // Reduce temp_order for all greater ordered items
          return { ...subtask, temp_order: subtask.temp_order - 1 };
        }
        return subtask;
      });
    });
  };
  

  const addSubtask = (prevOrder : number | null) =>{
    setLocalSubtasks((prevSubtasks) => {
      const updatedSubtasks = [...prevSubtasks, CreateBlankSubtask(prevOrder)]
      return updatedSubtasks;
    })
  };

  // ✅ Move Subtask Between Ordered and Unordered
  const moveSubtaskBetweenSections = (uuid: string) => {
    setLocalSubtasks((prev) => {
      let updatedSubtasks = [...prev];
      const subtaskIndex = updatedSubtasks.findIndex((entry) => entry.uuid === uuid);
      if (subtaskIndex === -1) return prev;

      const subtask = updatedSubtasks[subtaskIndex];

      if (subtask.temp_order === null) {
        // Moving to ordered: Assign last available order
        const orderedSubtasks = updatedSubtasks.filter((s) => s.temp_order !== null);
        const maxOrder = orderedSubtasks.length > 0 ? Math.max(...orderedSubtasks.map((s) => s.temp_order ?? 0)) : 0;
        updatedSubtasks[subtaskIndex] = { ...updatedSubtasks[subtaskIndex], temp_order: maxOrder + 1 };
      } else {
        // Moving to unordered: Remove order
        updatedSubtasks[subtaskIndex] = { ...updatedSubtasks[subtaskIndex], temp_order: null };

        // Reorder remaining ordered subtasks sequentially
        const orderedTasks = updatedSubtasks
          .filter((s) => s.temp_order !== null)
          .sort((a, b) => (a.temp_order ?? 0) - (b.temp_order ?? 0))
          .map((task, i) => ({ ...task, temp_order: i + 1  }));

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
      if (!subtaskEntry || subtaskEntry.temp_order == null) return prev;

      const currentOrder = subtaskEntry.temp_order;
      const swapOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;

      // Find the subtask with the swap order
      const swapIndex = updatedSubtasks.findIndex((s) => s.temp_order === swapOrder);
      if (swapIndex === -1) return prev;

      const targetIndex = updatedSubtasks.findIndex((s) => s.uuid === uuid);

      // Swap orders
      updatedSubtasks[targetIndex] = {
        ...updatedSubtasks[targetIndex],
        temp_order: swapOrder ,
      };

      updatedSubtasks[swapIndex] = {
        ...updatedSubtasks[swapIndex],
        temp_order: currentOrder ,
      };

      return updatedSubtasks;
    });
  };

  const findMaxOrder = () => {
    if (!localSubtasks || localSubtasks.length === 0) return 0;
  
    return localSubtasks
      .filter((localSubtask) => localSubtask.temp_order !== null && localSubtask.temp_order !== undefined)
      .reduce((max, localSubtask) => Math.max(max, localSubtask.temp_order as number), 0);
  };

  const getSubtasks = (): Subtask_data[] => {
    return localSubtasks.map((LocalSubtask) => ({
      subtaskId: LocalSubtask.subtask.subtaskId ?? undefined,
      title: LocalSubtask.subtask.title,
      description: LocalSubtask.subtask.description,
      duration: LocalSubtask.subtask.duration,
      importance_factor: LocalSubtask.subtask.importance_factor,
      order: LocalSubtask.temp_order,
      is_deleted: LocalSubtask.subtask.is_deleted ?? undefined,
    }));
  };
  

  // ✅ Filter out deleted subtasks
  const notDeletedSubtasks = localSubtasks.filter((entry) => entry.subtask.is_deleted !== true);

  // ✅ Separate ordered and unordered subtasks
  const orderedSubtasks = notDeletedSubtasks
    .filter((entry) => entry.temp_order !== null)
    .sort((a, b) => (a.temp_order ?? 0) - (b.temp_order ?? 0));

  const unorderedSubtasks = notDeletedSubtasks.filter((entry) => entry.temp_order === null);

  return {
    getSubtasks,
    orderedSubtasks,
    unorderedSubtasks,
    addSubtask,
    updateSubtaskField,
    deleteSubtask,
    moveSubtaskBetweenSections,
    changeSubtaskOrder,
    findMaxOrder,
  };
};

export default useSubtasks;
