"use client";
import {PlusCircleIcon} from "@heroicons/react/solid";
import TaskTable from "../../../components/TaskDisplays/TaskTable";
import FilterMenu from "../../../components/ui/FilterMenu";
import Modal from "../../../components/ui/Modal";
import { useTaskPage } from "../../../../packages/hooks/useTaskPage";
import { useRouter } from "next/navigation";
import { Task } from "@GlobalTypes/Task";
import TaskModal from "components/TaskCreation/TaskModal";
import TaskForm from "components/TaskCreation/TaskModalAi";
import DeleteTaskButton from "components/TaskDisplays/TaskActionButtons/DeleteTaskButton";
import EditTaskButton from "components/TaskDisplays/TaskActionButtons/EditTaskButton";
import FocusModeButton from "components/TaskDisplays/TaskActionButtons/FocusModeButton";
import ToggleCompletionButton from "components/TaskDisplays/TaskActionButtons/ToggleCompletionButton.tsx";

const TaskListPage = () => {
  const {
    tasks,
    subtasks,
    categories,
    loadingTasks,
    sortBy,
    isTaskModalOpen,
    isAITaskModalOpen,
    selectedTask,
    selectedSubtasks,
    showCompleted,
    selectedFilter,
    colourSchemeEnabled,
    handleFilterChange,
    handleSortChange,
    openTaskModal,
    closeTaskModal,
    handleSaveTask,
    handleSaveAITask,
    toggleTaskCompletion,
    isToggling,
    deleteTask,
    openNewTaskModal,
    isDeleting,
    openAITaskModal,
    setShowCompleted,
    setcolourSchemeEnabled,
    colourScheme,
    closeAITaskModal,
  } = useTaskPage();

  const router = useRouter();
  const goToFocusMode = (taskId: number) => {
    router.push(`/user/focus?task=${taskId}`);
  };

  const renderActions = (task: Task) => (
    <div className="flex space-x-2">
      {/* Toggle Completion Button */}
      <ToggleCompletionButton
        isCompleted={task.completed}
        onToggle={() => toggleTaskCompletion(task.id)}
        isToggling={isToggling}
        size="md"
      />
  
      {/* Edit Task Button */}
      <EditTaskButton onEdit={() => openTaskModal(task.id)} size="md" />
  
      {/* Delete Task Button */}
      <DeleteTaskButton
        onDelete={() => deleteTask(task.id)}
        isDeleting={isDeleting}
        size="md"
      />
  
      {/* Go to Focus Mode Button */}
      <FocusModeButton onFocus={() => goToFocusMode(task.id)} size="md" />
    </div>
  );


  if (loadingTasks) {
    return <p>Loading tasks...</p>;
  }

  return (
<div className="container mx-auto p-6 ">
  <div className="mt-6 inline-flex justify-between items-center gap-2">
    <button
      onClick={openNewTaskModal}
      className="px-4 py-2 rounded flex items-center space-x-2 text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
    >
      <PlusCircleIcon className="h-5 w-5" />
      <span>New Task</span>
    </button>
    <button
      onClick={openAITaskModal}
      className="px-4 py-2 rounded flex items-center space-x-2 text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
    >
      <PlusCircleIcon className="h-5 w-5" />
      <span>New Task AI</span>
    </button>
  </div>

  <div className="mt-4 flex justify-between items-center w-full">
    {/* Left section for Sort By and Show Completed */}
    <div className="flex items-center space-x-4">
      {/* Filter Menu with Dark Mode Support */}
      <FilterMenu categories={categories} onFilterChange={handleFilterChange} />

      {/* Sort By Dropdown */}
      <label htmlFor="sortBy" className="whitespace-nowrap text-gray-900 dark:text-gray-300">
        Sort By:
      </label>
      <select
        id="sortBy"
        onChange={handleSortChange}
        value={sortBy}
        className="p-2 border rounded bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
      >
        <option value="priority">Priority</option>
        <option value="dueDate">Due Date</option>
      </select>

      {/* Show Completed Tasks Checkbox */}
      <label htmlFor="showCompleted" className="whitespace-nowrap text-gray-900 dark:text-gray-300">
        Show Completed:
      </label>
      <input
        id="showCompleted"
        type="checkbox"
        checked={showCompleted}
        onChange={() => setShowCompleted(!showCompleted)}
        className="w-4 h-4 accent-blue-500 dark:accent-blue-400"
      />
    </div>

    {/* Right section for Enable/Disable colours button */}
    <div className="flex items-center">
      <button
        onClick={() => setcolourSchemeEnabled(!colourSchemeEnabled)}
        className="px-4 py-2 rounded flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-700 dark:hover:bg-gray-800"
      >
        <span>{colourSchemeEnabled ? "Disable colours" : "Enable colours"}</span>
      </button>
    </div>
  </div>

  <TaskTable
    tasks={tasks}
    categories={categories}
    selectedFilter={selectedFilter}
    sortBy={sortBy}
    renderActions={renderActions}
    colourScheme={colourScheme}
    colourSchemeEnabled={colourSchemeEnabled}
    showCompletedTasks={showCompleted}
    subtasks={subtasks}
  />

  <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} width="max-w-lg">
    <TaskModal
      categories={categories}
      existingTask={selectedTask}
      existing_subtasks={selectedSubtasks}
      onSave={handleSaveTask}
      onClose={closeTaskModal}
    />
  </Modal>
  <Modal isOpen={isAITaskModalOpen} onClose={closeAITaskModal} width="max-w-lg">
      <TaskForm 
        categories={categories} 
        onSave={handleSaveAITask} 
        onClose={closeAITaskModal} 
      />
  </Modal>
</div>
  );
};

export default TaskListPage;
