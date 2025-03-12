import React, { useState, useEffect } from "react";
import ImportanceSelector from "./ImportanceSelector";
import { Task } from "../../types/Task";
import { RepeatInterval } from "../../types/Task";
import { Category } from "../../types/Category";
import { saveTask } from "../../lib/api";

// Helper function to format due date
const formatDueDate = (date: string | null): string | null => {
  if (!date) return null;
  const parsedDate = new Date(date);
  return parsedDate.toISOString().split("T")[0]; // Formats as YYYY-MM-DD
};

// Helper function to map repeat interval
const mapRepeatIntervalToDropdownValue = (repeatInterval: RepeatInterval) => {
  if (repeatInterval.days === 1) return "Daily";
  if (repeatInterval.days === 7) return "Weekly";
  if (repeatInterval.months === 1) return "Monthly";
  return "None";
};



// Helper function to format repeat interval
const formatRepeatInterval = (repeatTask: string) => {
  switch (repeatTask) {
    case "Daily":
      return "1 day";
    case "Weekly":
      return "7 days";
    case "Monthly":
      return "1 month";
    default:
      return null;
  }
};

interface TaskModalProps {
  onClose: () => void;
  onSave: (task: Task) => void;
  existingTask?: Task | null;
  categories: Category[];
}

const TaskModal: React.FC<TaskModalProps> = ({ onClose, onSave, existingTask, categories }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [hours, setHours] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [importanceValue, setImportanceValue] = useState(6);
  const [description, setDescription] = useState("");
  const [repeatTask, setRepeatTask] = useState("None");
  const [category, setCategory] = useState("1");
  const [showMoreOptions, setShowMoreOptions] = useState(false);

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
    const totalDuration = (hours || 0) * 60 + (minutes || 0);

    const taskData = {
      taskId: existingTask?.id || undefined,
      title: taskTitle || null,
      description: description || null,
      due_date: dueDate || null,
      importance_factor: importanceValue,
      duration: totalDuration || null,
      repeat_interval: repeatTask !== "None" ? formatRepeatInterval(repeatTask) : null,
      category_id: category !== null ? parseInt(category) : null,
    };

    try {
      const savedTask = await saveTask(taskData, existingTask);
      onSave(savedTask);
      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  return (
    <div className="w-full space-y-4">
  <h2 className="text-xl font-bold">{existingTask ? "Edit Task" : "Create Task"}</h2>

  <input
    type="text"
    placeholder="Task Title"
    className="w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
    value={taskTitle}
    onChange={(e) => setTaskTitle(e.target.value)}
  />

  <textarea
    placeholder="Task Description (Optional)"
    className="w-full p-2 border rounded text-sm bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />

  <ImportanceSelector value={importanceValue} onChange={setImportanceValue} />

  <div className="flex items-center space-x-2">
    <label htmlFor="date" className="text-gray-700 dark:text-gray-300 text-sm">
      Due Date (Optional):
    </label>
    <input
      id="date"
      type="date"
      className="p-2 border rounded flex-1 text-sm bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
      value={dueDate || ""}
      onChange={(e) => setDueDate(e.target.value || null)}
    />
  </div>

  <div className="flex items-center space-x-2">
    <label className="text-gray-700 dark:text-gray-300 text-sm">Duration:</label>
    <input
      type="number"
      placeholder="Hours"
      className="p-2 border rounded w-1/3 text-sm bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
      value={hours || ""}
      onChange={(e) => setHours(e.target.value ? parseInt(e.target.value) : null)}
    />
    <input
      type="number"
      placeholder="Minutes"
      className="p-2 border rounded w-1/3 text-sm bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
      value={minutes || ""}
      onChange={(e) => setMinutes(e.target.value ? parseInt(e.target.value) : null)}
    />
  </div>

  <button
    onClick={() => setShowMoreOptions(!showMoreOptions)}
    className="text-blue-600 dark:text-blue-400 text-sm underline"
  >
    {showMoreOptions ? "Hide Options ⬆" : "More Options ⬇"}
  </button>

  {showMoreOptions && (
    <div className="mt-2 space-y-2 border-t pt-2 border-gray-300 dark:border-gray-600">
      <div className="flex items-center space-x-2">
        <label htmlFor="repeatTask" className="text-gray-700 dark:text-gray-300 text-sm">
          Repeat Task:
        </label>
        <select
          id="repeatTask"
          className="p-2 border rounded flex-1 text-sm bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
          value={repeatTask}
          onChange={(e) => setRepeatTask(e.target.value)}
        >
          <option value="None">None</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="category" className="text-gray-700 dark:text-gray-300 text-sm">
          Category:
        </label>
        <select
          id="category"
          className="p-2 border rounded flex-1 text-sm bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )}

  <div className="mt-4 flex justify-between">
    <button className="bg-gray-300 dark:bg-gray-700 dark:text-white px-4 py-2 rounded" onClick={onClose}>
      Cancel
    </button>
    <button className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded" onClick={handleSaveTask}>
      {existingTask ? "Update Task" : "Save Task"}
    </button>
  </div>
</div>

  );
};

export default TaskModal;
