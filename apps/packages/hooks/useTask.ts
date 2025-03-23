import { useState, useEffect } from "react";
import { formatDueDate, formatRepeatInterval, mapRepeatIntervalToDropdownValue } from "../utils/TaskModalUtils";
import { Subtask, Subtask_data, Task, Task_data } from "@GlobalTypes/Task";
import { useApiWrapper } from "./useApiWrapper";

export const useTask = (existingTask: Task | null, existingSubtasks: Subtask[] | null, onSave: (task: Task) => void) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [hours, setHours] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [importanceValue, setImportanceValue] = useState(6);
  const [description, setDescription] = useState("");
  const [repeatTask, setRepeatTask] = useState("None");
  const [category, setCategory] = useState("1");
  const { saveTask, saveSubtask } = useApiWrapper(); // ✅ Wrapped API call

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

  const saveTaskData = async (subtasks: Subtask_data[]) => {
    const totalDuration = (hours || 0) * 60 + (minutes || 0);

    const taskData: Task_data = {
      taskId: existingTask?.id || undefined,
      title: taskTitle,
      description: description || null,
      due_date: dueDate || null,
      importance_factor: importanceValue,
      duration: totalDuration || null,
      repeat_interval: repeatTask !== "None" ? formatRepeatInterval(repeatTask) : null,
      category_id: category !== null ? parseInt(category) : null,
    };

    try {
      const savedTask = await saveTask(taskData, existingTask);

      // Save subtasks
      await Promise.all(subtasks.map(async (subtask) => await saveSubtask(savedTask.id, subtask)));

      onSave(savedTask);
      return savedTask;
    } catch (err) {
      console.error("Error saving task:", err);
      throw err;
    }
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
    saveTaskData
  };
};
