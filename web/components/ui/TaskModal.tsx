import React, { useState, useEffect } from "react";
import ImportanceSelector from "./ImportanceSelector";
import { getFirebaseToken } from "../../lib/auth";

const TaskModal: React.FC<{ onClose: () => void; onSave: (task: any) => void; existingTask?: any; }> = ({ onClose, onSave, existingTask }) => {
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
      console.log("Received existing task data:", existingTask);

      setTaskTitle(existingTask.title || "");
      setDueDate(formatDueDate(existingTask.due_date));
      setImportanceValue(existingTask.importance_factor || 6);
      setDescription(existingTask.description || "");

      // Map repeat_interval to dropdown value
      const repeatInterval = existingTask.repeat_interval ? mapRepeatIntervalToDropdownValue(existingTask.repeat_interval) : "None";
      setRepeatTask(repeatInterval);

      setCategory(existingTask.category_id?.toString() || "1");

      // Convert total duration (minutes) into hours and minutes
      if (existingTask.duration) {
        setHours(Math.floor(existingTask.duration / 60));
        setMinutes(existingTask.duration % 60);
      }
    }
  }, [existingTask]);

  const formatDueDate = (date: string): string | null => {
    if (!date) return null;  // If there's no date, return null
    
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Update this function to handle the repeat intervals correctly
  const mapRepeatIntervalToDropdownValue = (repeatInterval: any) => {
    if (repeatInterval.days === 1) {
      return "Daily";
    }
    if (repeatInterval.days === 7) {
      return "Weekly";
    }
    if (repeatInterval.months === 1) {
      return "Monthly";
    }
    return "None";
  };

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
      category_id: category !== "1" ? parseInt(category) : null,
    };

    try {
      const token = await getFirebaseToken();
      if (!token) throw new Error("User is not authenticated");

      const endpoint = existingTask ? "http://localhost:5000/api/tasks/updateNulls" : "http://localhost:5000/api/tasks/create";
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
        return "7 days";
      case "Monthly":
        return "1 month";
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-bold">{existingTask ? "Edit Task" : "Create Task"}</h2>

      <input type="text" placeholder="Task Title" className="w-full p-2 border rounded" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />

      <textarea placeholder="Task Description (Optional)" className="w-full p-2 border rounded text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />

      <ImportanceSelector value={importanceValue} onChange={setImportanceValue} />

      <div className="flex items-center space-x-2">
        <label className="text-gray-700 text-sm">Due Date (Optional):</label>
        <input
          type="date"
          className="p-2 border rounded flex-1 text-sm"
          value={dueDate || ""}  // If dueDate is null, show empty
          onChange={(e) => setDueDate(e.target.value || null)}  // If cleared, set dueDate to null
        />
        </div>

      <div className="flex items-center space-x-2">
        <label className="text-gray-700 text-sm">Duration:</label>
        <input type="number" placeholder="Hours" className="p-2 border rounded w-1/3 text-sm" value={hours || ""} onChange={(e) => setHours(e.target.value ? parseInt(e.target.value) : null)} />
        <input type="number" placeholder="Minutes" className="p-2 border rounded w-1/3 text-sm" value={minutes || ""} onChange={(e) => setMinutes(e.target.value ? parseInt(e.target.value) : null)} />
      </div>

      <button onClick={() => setShowMoreOptions(!showMoreOptions)} className="text-blue-600 text-sm underline">
        {showMoreOptions ? "Hide Options ⬆" : "More Options ⬇"}
      </button>

      {showMoreOptions && (
        <div className="mt-2 space-y-2 border-t pt-2">
          <div className="flex items-center space-x-2">
            <label className="text-gray-700 text-sm">Repeat Task:</label>
            <select className="p-2 border rounded flex-1 text-sm" value={repeatTask} onChange={(e) => setRepeatTask(e.target.value)}>
              <option value="None">None</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-gray-700 text-sm">Category:</label>
            <select className="p-2 border rounded flex-1 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="1">General</option>
              <option value="2">Work</option>
              <option value="3">Personal</option>
              <option value="4">Urgent</option>
            </select>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Cancel</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleSaveTask}>{existingTask ? "Update Task" : "Save Task"}</button>
      </div>
    </div>
  );
};

export default TaskModal;
