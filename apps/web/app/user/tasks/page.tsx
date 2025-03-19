"use client";
import { CheckCircleIcon, EyeIcon, PencilIcon, PlusCircleIcon, TrashIcon, XCircleIcon } from "@heroicons/react/solid";
import TaskTable from "../../../components/TaskTable";
import FilterMenu from "../../../components/ui/FilterMenu";
import Modal from "../../../components/ui/Modal";
import TaskModal from "../../../components/ui/TaskModal";
import TaskForm from "../../../components/ui/TaskModalAi";
import { useTaskPage } from "../../../../packages/hooks/useTaskPage";
import { useRouter } from "next/navigation";
import { Task } from "@GlobalTypes/Task";

const TaskListPage = () => {
  const {
    settings,
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
    setIsAITaskModalOpen,
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
  <button
    onClick={() => toggleTaskCompletion(task.id)}
    className={`relative flex items-center justify-center w-10 h-10 rounded transition border-2 group
      ${task.completed ? "bg-green-500 border-green-500 text-white hover:bg-red-500 hover:border-red-500" 
      : "border-gray-400 text-gray-500 hover:bg-green-500 hover:border-green-500 hover:text-white"}
      ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
    type="button"
    aria-label={task.completed ? "Unmark Task as Complete" : "Mark Task as Complete"}
    disabled={isToggling}
  >
    {/* Tooltip */}
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
      {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
    </span>

    {/* Show tick when completed, X on hover */}
    {task.completed ? (
      <>
        <CheckCircleIcon className="h-5 w-5 group-hover:hidden" />
        <XCircleIcon className="h-5 w-5 hidden group-hover:block" />
      </>
    ) : (
      <CheckCircleIcon className="h-5 w-5" />
    )}
  </button>

  {/* Edit Task Button */}
  <button
    onClick={() => openTaskModal(task.id)}
    className="relative flex items-center justify-center w-10 h-10 bg-yellow-500 text-white rounded transition hover:bg-yellow-600 group"
    type="button"
    aria-label="Edit Task"
  >
    {/* Tooltip */}
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
      Edit Task
    </span>

    <PencilIcon className="h-5 w-5" />
  </button>

  {/* Delete Task Button */}
  <button
    onClick={() => deleteTask(task.id)}
    className={`relative flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded transition hover:bg-red-600 group ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
    type="button"
    aria-label="Delete Task"
    disabled={isDeleting}
  >
    {/* Tooltip */}
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
      Delete Task
    </span>

    <TrashIcon className="h-5 w-5" />
  </button>

  {/* Go to Focus Mode Button */}
  <button
    onClick={() => goToFocusMode(task.id)}
    className="relative flex items-center justify-center w-10 h-10 bg-purple-500 text-white rounded transition hover:bg-purple-600 group"
    type="button"
    aria-label="Go to Focus Mode"
  >
    {/* Tooltip */}
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
      Focus Mode
    </span>

    <EyeIcon className="h-5 w-5" />
  </button>
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
