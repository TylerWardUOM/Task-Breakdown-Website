"use client";

import { useState } from "react";
import { getTaskBreakdown } from "../../lib/getTaskBreakdown";
import { TaskBreakdownResponse, MainTask, SubTask, TaskDuration } from "../../types/Task";

export default function TaskForm() {
  const [taskInput, setTaskInput] = useState("");
  const [taskData, setTaskData] = useState<TaskBreakdownResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle API request
  const fetchTaskBreakdown = async (taskText: string) => {
    setLoading(true);
    setTaskData(null);

    const response = await getTaskBreakdown(taskText);
    setTaskData(response);
    setLoading(false);
  };

  // Handle submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    fetchTaskBreakdown(taskInput);
  };

  // Edit main task field
  const updateMainTaskField = (field: keyof MainTask, value: string | TaskDuration | null) => {
    if (taskData) {
      setTaskData({
        ...taskData,
        main_task: {
          ...taskData.main_task,
          [field]: value,
        },
      });
    }
  };

  // Edit subtask field
  const updateSubtaskField = (index: number, field: keyof SubTask, value: string | number | TaskDuration | null) => {
    if (taskData) {
      const updatedSubtasks = [...taskData.subtasks];
      updatedSubtasks[index] = { ...updatedSubtasks[index], [field]: value };
      setTaskData({ ...taskData, subtasks: updatedSubtasks });
    }
  };

  // Delete subtask
  const deleteSubtask = (index: number) => {
    if (taskData) {
      const updatedSubtasks = taskData.subtasks.filter((_, i) => i !== index);
      setTaskData({ ...taskData, subtasks: updatedSubtasks });
    }
  };

  // Add a new subtask manually
  const addSubtask = () => {
    if (taskData) {
      const newSubtask: SubTask = {
        title: "",
        description: null, // Default to null
        duration: null, // Default to null
        importance_factor: 4, // Default importance
      };

      setTaskData({ ...taskData, subtasks: [...taskData.subtasks, newSubtask] });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 p-6 bg-white shadow-md rounded-lg dark:bg-gray-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Task Breakdown Generator</h2>

      {/* Task Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-3 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
          placeholder="Enter your task..."
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          rows={3}
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Breakdown"}
        </button>
      </form>

      {/* Editable Task & Subtasks */}
      {taskData && (
        <div className="space-y-4 p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
          {/* Main Task */}
          <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-700 dark:border dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Main Task</h3>
            <input
              type="text"
              className="w-full p-2 mt-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
              value={taskData.main_task?.title || ""}
              onChange={(e) => updateMainTaskField("title", e.target.value)}
              placeholder="Enter main task title..."
            />
            <textarea
              className="w-full p-2 mt-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
              value={taskData.main_task?.description || ""}
              onChange={(e) => updateMainTaskField("description", e.target.value || null)}
              placeholder="Enter main task description..."
              rows={2}
            />
          </div>

          {/* Subtasks */}
          <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-700 dark:border dark:border-gray-600 mt-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">Subtasks</h4>
            <div className="space-y-3">
              {taskData.subtasks.map((subtask, index) => (
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
                      value={subtask.duration?.hours ?? ""}
                      onChange={(e) =>
                        updateSubtaskField(index, "duration", {
                          ...subtask.duration,
                          hours: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="Hrs"
                    />
                    <input
                      type="number"
                      className="p-1 border rounded w-16 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
                      value={subtask.duration?.minutes ?? ""}
                      onChange={(e) =>
                        updateSubtaskField(index, "duration", {
                          ...subtask.duration,
                          minutes: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="Mins"
                    />
                  </div>

                  {/* Importance Factor */}
                  <label className="text-sm text-gray-600 dark:text-gray-300">Importance:</label>
                  <select
                    className="p-1 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    value={subtask.importance_factor}
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
          </div>
        </div>
      )}
    </div>
  );
}
