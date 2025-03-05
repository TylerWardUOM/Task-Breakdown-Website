import React, { useState } from "react";
import ColourChangingSlider from "./ColourChangingSlider";
import SubtaskInput from "./SubtaskInput";
import SubtaskList from "./SubtaskList";  // Subtasks management
import TaskDependencies from "./TaskDependencies";  // Dependency management

const TaskModal: React.FC<{
  onClose: () => void;
  onSave: (task: any) => void;
  existingTask?: any; // Optional existing task for dependencies
}> = ({ onClose, onSave, existingTask }) => {
  // Step tracking state
  const [currentStep, setCurrentStep] = useState(1);

  // Task details state (Step 1)
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | undefined>(""); // Optional due date
  const [duration, setDuration] = useState(0);
  const [importanceValue, setImportanceValue] = useState(5);
  const [description, setDescription] = useState("");
  const [repeatTask, setRepeatTask] = useState(false);

  // Subtask handling state (Step 2)
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [nextId, setNextId] = useState(1); // State to track the next ID for subtasks

  const handleAddSubtask = (subtask: any) => {
    setSubtasks((prevSubtasks) => [...prevSubtasks, subtask]);
    setNextId((prevId) => prevId + 1); // Increment ID after adding subtask
  };

  const handleRemoveSubtask = (id: number) => {
    setSubtasks((prevSubtasks) => prevSubtasks.filter((subtask) => subtask.id !== id));
  };

  // Dependencies (Step 3)
  const [dependency, setDependency] = useState<string | undefined>(existingTask?.title);

  const handleSaveTask = () => {
    const newTask = {
      title: taskTitle,
      dueDate,
      duration,
      importance: importanceValue,
      description,
      dependency,
      subtasks,
      repeatTask,
    };
    onSave(newTask);
    onClose();
  };

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-bold">{existingTask ? "Edit Task" : "Create Task"}</h2>

      {/* Step 1: Task Info */}
      {currentStep === 1 && (
        <div className="mt-4 space-y-4">
          <label className="block text-gray-700">Task Title:</label>
          <input
            type="text"
            placeholder="Task Title"
            className="w-full p-2 border rounded"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />

          <label className="block text-gray-700">Task Description:</label>
          <textarea
            placeholder="Task Description"
            className="w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="block text-gray-700">Due Date (Optional):</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <label className="block text-gray-700">Estimated Duration:</label>
          <input
            type="number"
            placeholder="Duration (minutes)"
            className="w-full p-2 border rounded"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
          />

          <ColourChangingSlider
            label="Task Importance"
            min={1}
            max={10}
            value={importanceValue}
            onChange={setImportanceValue}
            lowText="Low"
            highText="High"
          />

          <label className="block text-gray-700">Repeat Task:</label>
          <input
            type="checkbox"
            checked={repeatTask}
            onChange={() => setRepeatTask(!repeatTask)}
          />
        </div>
      )}

      {/* Step 2: Add Subtasks */}
      {currentStep === 2 && (
        <div>
          <SubtaskInput onAddSubtask={handleAddSubtask} nextId={nextId} />
          <SubtaskList subtasks={subtasks} onRemoveSubtask={handleRemoveSubtask} setSubtasks={setSubtasks} />
        </div>
      )}

      {/* Step 3: Task Dependencies */}
      {currentStep === 3 && (
        <div>
          <TaskDependencies
            dependency={dependency}
            onChange={(task: string) => setDependency(task)}
          />
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
        {currentStep < 3 ? (
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
