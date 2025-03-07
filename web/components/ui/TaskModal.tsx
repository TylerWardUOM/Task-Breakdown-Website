"use client";
import React, { useState, useEffect } from "react";
import ImportanceSelector from "./ImportanceSelector";
import { getFirebaseToken } from "../../lib/auth";

const TaskModal: React.FC<{
  onClose: () => void;
  onSave: (task: any) => void;
  existingTask?: any;
}> = ({ onClose, onSave, existingTask }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [importanceValue, setImportanceValue] = useState(6);
  const [description, setDescription] = useState("");
  const [repeatTask, setRepeatTask] = useState("None");
  const [category, setCategory] = useState("1");

  const [showMoreOptions, setShowMoreOptions] = useState(false);

  useEffect(() => {
    if (existingTask) {
      setTaskTitle(existingTask.title || "");
      setDueDate(existingTask.due_date || null);
      setDuration(existingTask.duration || null);
      setImportanceValue(existingTask.importance_factor || 6);
      setDescription(existingTask.description || "");
      setRepeatTask(existingTask.repeat_interval ? existingTask.repeat_interval.replace("INTERVAL '1 ", "").replace("'", "") : "None");
      setCategory(existingTask.category_id?.toString() || "1");
    }
  }, [existingTask]);

  const handleSaveTask = async () => {
    const taskData = {
      taskId: existingTask?.id || undefined,
      title: taskTitle || null,
      description: description || null,
      due_date: dueDate || null,
      importance_factor: importanceValue,
      duration: duration !== null ? duration : null,
      // Correctly format the repeat_interval based on the selected value
      repeat_interval: repeatTask && repeatTask !== "None" 
        ? formatRepeatInterval(repeatTask)  // Use helper function to format interval
        : null,  // If repeatTask is "None", set to null
      category_id: category !== "1" ? parseInt(category) : null,
    };
  
    try {
      const token = await getFirebaseToken();
      if (!token) throw new Error("User is not authenticated");
  
      const endpoint = existingTask
        ? "http://localhost:5000/api/tasks/update"
        : "http://localhost:5000/api/tasks/create";
      const method = existingTask ? "PUT" : "POST";
  
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });
  
      if (!response.ok) {
        throw new Error(existingTask ? "Failed to update task" : "Failed to create task");
      }
  
      const savedTask = await response.json();
      onSave(savedTask);
      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };
  
  const formatRepeatInterval = (repeatTask: string) => {
    switch (repeatTask) {
      case "Daily":
        return "1 day";
      case "Weekly":
        return "1 week";
      case "Monthly":
        return "1 month";
      default:
        return null;
    }
  };
  
  

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-bold">{existingTask ? "Edit Task" : "Create Task"}</h2>

      <input
        type="text"
        placeholder="Task Title"
        className="w-full p-2 border rounded"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
      />

      <textarea
        placeholder="Task Description (Optional)"
        className="w-full p-2 border rounded text-sm"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <ImportanceSelector value={importanceValue} onChange={setImportanceValue} />

      <div className="flex items-center space-x-2">
        <label className="text-gray-700 text-sm">Due Date (Optional):</label>
        <input
          type="date"
          className="p-2 border rounded flex-1 text-sm"
          value={dueDate || ""}
          onChange={(e) => setDueDate(e.target.value || null)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-gray-700 text-sm">Duration (mins):</label>
        <input
          type="number"
          placeholder="Optional"
          className="p-2 border rounded flex-1 text-sm"
          value={duration || ""}
          onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : null)}
        />
      </div>

      <button
        onClick={() => setShowMoreOptions(!showMoreOptions)}
        className="text-blue-600 text-sm underline"
      >
        {showMoreOptions ? "Hide Options ⬆" : "More Options ⬇"}
      </button>

      {showMoreOptions && (
        <div className="mt-2 space-y-2 border-t pt-2">
          <div className="flex items-center space-x-2">
            <label className="text-gray-700 text-sm">Repeat Task:</label>
            <select
              className="p-2 border rounded flex-1 text-sm"
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
            <label className="text-gray-700 text-sm">Category:</label>
            <select
              className="p-2 border rounded flex-1 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="1">General</option>
              <option value="2">Work</option>
              <option value="3">Life</option>
              <option value="4">Other</option>
            </select>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
          Cancel
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleSaveTask}>
          {existingTask ? "Update Task" : "Save Task"}
        </button>
      </div>
    </div>
  );
};

export default TaskModal;
