import React, { useState, useEffect } from "react";
import ColourChangingSlider from "./ColourChangingSlider"; // Slider for importance

const TaskModal: React.FC<{
  onClose: () => void;
  onSave: (task: any) => void;
  existingTask?: any; // Optional existing task for editing
}> = ({ onClose, onSave, existingTask }) => {
  // Step tracking state (Only Step 1 now)
  const [currentStep, setCurrentStep] = useState(1);

  // Task details state (Step 1)
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | undefined>(""); // Optional due date
  const [duration, setDuration] = useState(0);
  const [importanceValue, setImportanceValue] = useState(5);
  const [description, setDescription] = useState("");
  const [repeatTask, setRepeatTask] = useState("Daily"); // Default to Daily
  const [category, setCategory] = useState("Life");

  // If there's an existing task, populate the form with its data
  useEffect(() => {
    if (existingTask) {
      setTaskTitle(existingTask.title);
      setDueDate(existingTask.dueDate);
      setDuration(existingTask.duration);
      setImportanceValue(existingTask.importance);
      setDescription(existingTask.description);
      setRepeatTask(existingTask.repeatTask);
      setCategory(existingTask.category);
    }
  }, [existingTask]); // This effect runs only when `existingTask` changes

  const handleSaveTask = () => {
    const newTask = {
      title: taskTitle,
      dueDate,
      duration,
      importance: importanceValue,
      description,
      repeatTask,
      category,
    };
    onSave(newTask); // Save task and pass to the parent
    onClose(); // Close the modal after saving
  };

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-bold">{existingTask ? "Edit Task" : "Create Task"}</h2>

      {/* Step 1: Task Info */}
      {currentStep === 1 && (
        <div className="mt-4 space-y-4">
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
            placeholder="Task Description"
            className="w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Task Importance Slider */}
          <ColourChangingSlider
            label="Task Importance"
            min={1}
            max={10}
            value={importanceValue}
            onChange={setImportanceValue}
            lowText="Low"
            highText="High"
          />

          {/* Due Date (Label and Input in same row) */}
          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Due Date (Optional):</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Duration (Label and Input in same row below Due Date) */}
          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Estimated Duration:</label>
            <input
              type="number"
              placeholder="Duration (minutes)"
              className="w-full p-2 border rounded"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
            />
          </div>

          {/* Repeat Task (Select dropdown) */}
          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Repeat Task:</label>
            <select
              className="p-2 border rounded"
              value={repeatTask}
              onChange={(e) => setRepeatTask(e.target.value)}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Category (Select dropdown) */}
          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Category:</label>
            <select
              className="p-2 border rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Work">Work</option>
              <option value="Life">Life</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-4 flex justify-between space-x-2">
        {currentStep > 1 && (
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Back
          </button>
        )}
        {currentStep < 1 ? (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Next
          </button>
        ) : (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleSaveTask}
          >
            Save Task
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskModal;
