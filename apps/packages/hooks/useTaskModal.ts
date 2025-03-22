import { useState, useEffect, useRef } from "react";
import { Task, Subtask, Subtask_data } from "@GlobalTypes/Task";
import { formatDueDate, formatRepeatInterval, mapRepeatIntervalToDropdownValue } from "../utils/TaskModalUtils";
import { useTasks } from "./useTasks";

export const useTaskModal = (existingTask: Task | null, existingSubtasks: Subtask[] | null, onSave: (task: Task) => void, onClose: () => void) => {
  const { saveTaskData } = useTasks(); // Get saveTaskData function from useTasks
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [hours, setHours] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [importanceValue, setImportanceValue] = useState(6);
  const [description, setDescription] = useState("");
  const [repeatTask, setRepeatTask] = useState("None");
  const [category, setCategory] = useState("1");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const subtaskModalRef = useRef<{ getSubtasks: () => Subtask_data[] } | null>(null);

  useEffect(() => {
    if (existingTask) {
      setTaskTitle(existingTask.title || "");
      setDueDate(formatDueDate(existingTask.due_date));
      setImportanceValue(existingTask.importance_factor || 6);
      setDescription(existingTask.description || "");

      const repeatInterval = existingTask.repeat_interval ? mapRepeatIntervalToDropdownValue(existingTask.repeat_interval) : "None";
      setRepeatTask(repeatInterval);
      setCategory(existingTask.category_id?.toString() || "1");

      if (existingTask.duration) {
        setHours(Math.floor(existingTask.duration / 60));
        setMinutes(existingTask.duration % 60);
      }
    }
  }, [existingTask]);

  const handleSaveTask = async () => {
    const latestSubtasks = subtaskModalRef.current?.getSubtasks() || [];

    await saveTaskData(existingTask, {
      taskTitle,
      dueDate,
      hours,
      minutes,
      importanceValue,
      description,
      repeatTask,
      category,
    }, latestSubtasks, onSave);

    onClose();
  };

  return {
    taskTitle, setTaskTitle,
    dueDate, setDueDate,
    hours, setHours,
    minutes, setMinutes,
    importanceValue, setImportanceValue,
    description, setDescription,
    repeatTask, setRepeatTask,
    category, setCategory,
    showMoreOptions, setShowMoreOptions,
    subtaskModalRef,
    handleSaveTask,
  };
};
