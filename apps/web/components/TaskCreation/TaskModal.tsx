import { Category } from "@GlobalTypes/Category";
import { Subtask, Task } from "@GlobalTypes/Task";
import { useTaskModal } from "@Hooks/useTaskModal";
import React from "react";
import ImportanceSelector from "./ImportanceSelector";
import SubtaskModal from "./SubtaskModal";

interface TaskModalProps {
  onClose: () => void;
  onSave: (task: Task) => void;
  existingTask?: Task | null;
  existing_subtasks?: Subtask[] | null;
  categories: Category[];
}

const TaskModal: React.FC<TaskModalProps> = ({ onClose, onSave, existingTask, categories, existing_subtasks }) => {
  const {
    taskTitle,
    setTaskTitle,
    dueDate,
    hours,
    setHours,
    minutes,
    setMinutes,
    importanceValue,
    setImportanceValue,
    description,
    setDescription,
    repeatTask,
    setRepeatTask,
    category,
    setCategory,
    showMoreOptions,
    setShowMoreOptions,
    handleSaveTask,
    subtaskModalRef,
    saving,
    handleDateChange
  } = useTaskModal(existingTask || null, existing_subtasks || null, onSave, onClose);


  return (
    <div className="w-full space-y-4 p-6">
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
          onChange={handleDateChange}
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
          <SubtaskModal ref={subtaskModalRef} existing_subtasks={existing_subtasks}></SubtaskModal>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <button className="bg-gray-300 dark:bg-gray-700 dark:text-white px-4 py-2 rounded" onClick={onClose}>
          Cancel
        </button>
        <button className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleSaveTask}
          disabled={saving}>
          {existingTask ? "Update Task" : "Save Task"}
        </button>
      </div>
    </div>

  );
};

export default TaskModal;
