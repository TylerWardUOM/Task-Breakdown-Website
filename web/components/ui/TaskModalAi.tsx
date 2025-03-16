"use client";

import { useState } from "react";
import { getTaskBreakdown } from "../../lib/getTaskBreakdown";
import { TaskBreakdownResponse, Task_data, Subtask_data } from "../../types/Task";
import { Category } from "../../types/Category";
import ImportanceSelector from "./ImportanceSelector";
import { formatRepeatInterval, mapRepeatIntervalToDropdownValue, parseRepeatInterval } from "../../lib/taskUtils";
import { saveTask } from "../../lib/api";


// Define the props structure for TaskForm
interface TaskFormProps {
    categories: Category[];
    onSave: (task: Task_data) => void; // Callback for when a task is saved
    onClose: () => void; // Callback for closing the form
  }
  

const TaskForm: React.FC<TaskFormProps> = ({categories, onSave, onClose}) => {
  const [taskInput, setTaskInput] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [importance, setImportance] = useState<number>(4);
  const [taskData, setTaskData] = useState<Task_data | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask_data[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("1");
  const [repeatTask, setRepeatTask] = useState("None");
  const [showResults, setShowResults] = useState(false); // Toggle between form & results


  // Convert AI duration to minutes
  const convertToMinutes = (duration: { hours: number; minutes: number } | null): number | null =>
    duration ? duration.hours * 60 + duration.minutes : null;

  // Fetch AI task breakdown
  const fetchTaskBreakdown = async (taskText: string) => {
    setLoading(true);
    setTaskData(null);
    setSubtasks([]);

    const response: TaskBreakdownResponse | null = await getTaskBreakdown(taskText);
    
    if (!response) {
        throw new Error("Failed to fetch task breakdown. Please try again later.");
      }
  
      if (!response.main_task) {
        throw new Error("Invalid response structure. Missing main task.");
      }

    const newMainTask: Task_data = {
      taskId: undefined,
      title: response.main_task.title,
      description: response.main_task.description,
      duration: convertToMinutes(response.main_task.duration),
      due_date: dueDate, // User-inputted due date
      importance_factor: importance, // User-inputted importance
      repeat_interval: repeatTask !== "None" ? formatRepeatInterval(repeatTask) : null,
      category_id: category !== null ? parseInt(category) : null,
    };

    const newSubtasks: Subtask_data[] = response.subtasks.map((subtask) => ({
      subtaskId: undefined,
      title: subtask.title,
      description: subtask.description,
      duration: convertToMinutes(subtask.duration),
      importance_factor: subtask.importance_factor,
    }));

    setTaskData(newMainTask);
    setSubtasks(newSubtasks);
    setLoading(false);
    setShowResults(true); // Switch to showing results
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    fetchTaskBreakdown(taskInput);
  };

  // Update Main Task Field
  const updateMainTaskField = (field: keyof Task_data, value: unknown) => {
    if (taskData) {
      setTaskData({ ...taskData, [field]: value });
    }
  };

  // Update Subtask Field
  const updateSubtaskField = (index: number, field: keyof Subtask_data, value: unknown) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = { ...updatedSubtasks[index], [field]: value };
    setSubtasks(updatedSubtasks);
  };

  // Delete Subtask
  const deleteSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  // Confirm before regenerating
  const handleRegenerate = () => {
    const confirmRegenerate = window.confirm("Regenerating will discard any edits. Continue?");
    if (confirmRegenerate) {
      fetchTaskBreakdown(taskInput);
    }
  };

  const handleSaveTask = async () => {
    if (!taskData) return;
  
    try {
      // Save main task
      const savedTask = await saveTask(taskData);
  
      // Save each subtask linked to the saved task
      const savedSubtasks = await Promise.all(
        subtasks.map(async (subtask) => {
          const subtaskToSave = {
            ...subtask,
            parent_task_id: savedTask.taskId, // Link subtask to the main task
          };
          //return await saveSubtask(subtaskToSave);
          return;
        })
      );
  
      console.log("Task saved successfully!", savedTask, "Subtasks saved:", savedSubtasks);
  
      // Call parent onSave handler if provided
      if (onSave) {
        onSave(savedTask);
      }
  
      // Close the form after saving
      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };
  

// Confirm before editing prompt
const handleEditPrompt = () => {
    const confirmEdit = window.confirm("Editing the prompt will discard current results. Continue?");
    if (confirmEdit) {
        setShowResults(false); // Show input form again
    }
    };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 p-6 bg-white shadow-md rounded-lg dark:bg-gray-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Task Breakdown Generator</h2>

      {/* Task Input Form */}
      {!showResults && (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Textarea */}
        <textarea
          className="w-full p-3 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
          placeholder="Enter your task..."
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          rows={3}
        />

        {/* Due Date Input */}
        <label htmlFor="Due Date"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date:</label>
        <input
          id="Due Date"
          type="date"
          className="w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
          value={dueDate || ""}
          onChange={(e) => setDueDate(e.target.value || null)}
        />

        {/* Importance Factor */}
        <ImportanceSelector value={importance} onChange={setImportance}></ImportanceSelector>
        
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
        {/* Generate Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Breakdown"}
        </button>
      </form>
        )}
     {/* Editable Task & Subtasks */}
{showResults && taskData && (
  <div className="space-y-4 p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
    {/* Main Task */}
    <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-700 dark:border dark:border-gray-600">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Main Task</h3>
      <input
        type="text"
        className="w-full p-2 mt-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
        value={taskData.title}
        onChange={(e) => updateMainTaskField("title", e.target.value)}
        placeholder="Enter main task title..."
      />
      <textarea
        className="w-full p-2 mt-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
        value={taskData.description || ""}
        onChange={(e) => updateMainTaskField("description", e.target.value || null)}
        placeholder="Enter main task description..."
        rows={2}
      />

      {/* Persisted Due Date */}
      <label htmlFor="Due Date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date:</label>
      <input
        id="Due Date"
        type="date"
        className="w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
        value={taskData.due_date || ""}
        onChange={(e) => updateMainTaskField("due_date", e.target.value || null)}
      />

      {/* Persisted Importance */}
            <ImportanceSelector
              value={taskData.importance_factor ?? 4}
              onChange={(value) => updateMainTaskField("importance_factor", value)}
            />   

            {/* Duration */}
            <div className="flex items-center space-x-2 mt-2">
              <label className="text-sm text-gray-600 dark:text-gray-300">Duration:</label>
              <input
                type="number"
                className="p-1 border rounded w-16 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
                value={taskData.duration ?? ""}
                onChange={(e) =>
                    updateMainTaskField("duration", e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Mins"
              />
            </div>

        <div className="flex items-center space-x-2">
        <label htmlFor="category" className="text-gray-700 dark:text-gray-300 text-sm">
          Category:
        </label>
        <select
          id="category"
          className="p-2 border rounded flex-1 text-sm bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
          value={taskData?.category_id ?? ""} // ✅ Uses taskData value
          onChange={(e) => updateMainTaskField("category_id", Number(e.target.value))}
          >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <label htmlFor="repeatTask" className="text-gray-700 dark:text-gray-300 text-sm">
          Repeat Task:
        </label>
        <select
          id="repeatTask"
          className="p-2 border rounded flex-1 text-sm bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
          value={mapRepeatIntervalToDropdownValue(parseRepeatInterval(taskData?.repeat_interval))} // ✅ Properly maps stored value to dropdown
          onChange={(e) => updateMainTaskField("repeat_interval", formatRepeatInterval(e.target.value))}
          >
          <option value="None">None</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>
    </div>

    {/* Subtasks */}
    <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-700 dark:border dark:border-gray-600 mt-2">
      <h4 className="font-semibold text-gray-900 dark:text-white">Subtasks</h4>
      <div className="space-y-3">
        {subtasks.map((subtask, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border relative dark:bg-gray-800 dark:border-gray-700">
            <button
              onClick={() => deleteSubtask(index)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
            >
              ✕
            </button>

            <input
              type="text"
              className="w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
              value={subtask.title}
              onChange={(e) => updateSubtaskField(index, "title", e.target.value)}
              placeholder="Enter subtask title..."
            />
            <textarea
              className="w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 mt-2"
              value={subtask.description || ""}
              onChange={(e) => updateSubtaskField(index, "description", e.target.value || null)}
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
                  updateSubtaskField(index, "duration", e.target.value ? Number(e.target.value) : null)
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
              onChange={(e) => updateSubtaskField(index, "importance_factor", Number(e.target.value))}
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
            </select>
          </div>
        ))}
      </div>

      {/* Buttons for actions */}
      <div className="flex space-x-4 mt-4">
        <button
          onClick={handleEditPrompt}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Edit Prompt
        </button>
        <button
          onClick={handleRegenerate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Regenerate
        </button>
        {/* Save Task Button */}
        <button
        onClick={handleSaveTask}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
        Save Task
        </button>

      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default TaskForm;