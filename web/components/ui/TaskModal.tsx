"use client";
import React, { useState, useEffect } from "react";
import ImportanceSelector from "./ImportanceSelector"; // Now using the emoji selector!
import { useRouter } from "next/router"; // Import useRouter from next/router
import { getFirebaseToken } from "../../lib/auth"; // Import the function to get the auth token

const TaskModal: React.FC<{
  onClose: () => void;
  onSave: (task: any) => void;
  existingTask?: any;
}> = ({ onClose, onSave, existingTask }) => {
  // Task details state
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | undefined>(""); // Optional
  const [duration, setDuration] = useState<number | undefined>(undefined); // Optional
  const [importanceValue, setImportanceValue] = useState(6); // Default to Medium
  const [description, setDescription] = useState("");
  const [repeatTask, setRepeatTask] = useState("None"); // Default to "None"
  const [category, setCategory] = useState("General"); // Default to "General"

  // Toggle for "More Options"
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  // Populate fields if editing an existing task
  useEffect(() => {
    if (existingTask) {
      setTaskTitle(existingTask.title);
      setDueDate(existingTask.dueDate);
      setDuration(existingTask.duration);
      setImportanceValue(existingTask.importance);
      setDescription(existingTask.description);
      setRepeatTask(existingTask.repeatTask || "None"); // Ensure "None" is used if missing
      setCategory(existingTask.category || "General"); // Ensure "General" is used if missing
    }
  }, [existingTask]);

  const handleSaveTask = async () => {
    const taskData = {
      id: existingTask?.id, // Only use ID if editing an existing task
      title: taskTitle,
      due_date: dueDate,
      duration,
      importance_factor: importanceValue,
      description,
      repeat_interval: repeatTask === "None" ? null : `INTERVAL '1 ${repeatTask.toLowerCase()}'`,
      category_id: category,
    };

    try {
      // Get the auth token
      const token = await getFirebaseToken();

      if (!token) {
        throw new Error("User is not authenticated");
      }

      let response;
      if (existingTask) {
        // Update the existing task (PUT request)
        response = await fetch(`http://localhost:5000/api/tasks/update/${existingTask.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          body: JSON.stringify(taskData),
        });
      } else {
        // Create a new task (POST request)
        response = await fetch("http://localhost:5000/api/tasks/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          body: JSON.stringify(taskData),
        });
      }

      if (!response.ok) {
        throw new Error(existingTask ? "Failed to update task" : "Failed to create task");
      }

      const savedTask = await response.json();

      // Call the onSave function to handle saving on the parent component (optional)
      onSave(savedTask);

      // Redirect to task list page (or any page you want to navigate to)
      router.push("/tasks"); // You can change this to the page where tasks are displayed

      // Close the modal
      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-bold">{existingTask ? "Edit Task" : "Create Task"}</h2>

      {/* Task Title */}
      <input
        type="text"
        placeholder="Task Title"
        className="w-full p-2 border rounded"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
      />

      {/* Task Description */}
      <textarea
        placeholder="Task Description (Optional)"
        className="w-full p-2 border rounded text-sm"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Task Importance Selector */}
      <ImportanceSelector value={importanceValue} onChange={setImportanceValue} />

      {/* Due Date & Duration */}
      <div className="flex items-center space-x-2">
        <label className="text-gray-700 text-sm">Due Date (Optional):</label>
        <input
          type="date"
          className="p-2 border rounded flex-1 text-sm"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-gray-700 text-sm">Duration (mins):</label>
        <input
          type="number"
          placeholder="Optional"
          className="p-2 border rounded flex-1 text-sm"
          value={duration || ""}
          onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
        />
      </div>

      {/* More Options Toggle */}
      <button
        onClick={() => setShowMoreOptions(!showMoreOptions)}
        className="text-blue-600 text-sm underline"
      >
        {showMoreOptions ? "Hide Options ⬆" : "More Options ⬇"}
      </button>

      {/* More Options Section */}
      {showMoreOptions && (
        <div className="mt-2 space-y-2 border-t pt-2">
          {/* Repeat Task */}
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

          {/* Category */}
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

      {/* Save & Close Buttons */}
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
