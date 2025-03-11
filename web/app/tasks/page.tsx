"use client";
import { useState} from "react";
import { useRouter } from "next/navigation";
import TaskTable from "../../components/TaskTable";
import Modal from "../../components/ui/Modal";
import TaskModal from "../../components/ui/TaskModal";
import { PlusCircleIcon, PencilIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from "@heroicons/react/solid";
import { useAuth } from "../../contexts/authContext";
import useFetchTasks from "../../hooks/useFetchTasks"; // Import the hook
import { Task } from "../../types/Task";
import useFetchCategories from "../../hooks/useFetchCategories";
import FilterMenu from "../../components/ui/FilterMenu";
import { Filter } from "../../types/Filter";
import { useUserSettings } from "../../contexts/UserSettingsContext";


const TaskListPage = () => {
  const {firebaseToken, redirectToLogin } = useAuth();
  const {settings} = useUserSettings();
  const [sortBy, setSortBy] = useState<string>("priority"); // Default sorting by priority
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Filter>({
    filter: null,
    minPriority: 1,
    maxPriority: 10,
    selectedCategories: [],
  });


  const router = useRouter();

  const [colourSchemeEnabled, setcolourSchemeEnabled] = useState(true);
  const colourScheme = settings.colour_scheme;

  // Using the hook to fetch tasks
  const { tasks, loadingTasks, setTasks } = useFetchTasks(firebaseToken);
  const { categories, /*loadingCategories, setCategories*/ } = useFetchCategories(firebaseToken);

  const handleFilterChange = (filters: {
    filter: string | null;
    minPriority: number;
    maxPriority: number;
    selectedCategories: number[];
  }) => {
    setSelectedFilter(filters);
  };


  const openNewTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
  };

  const toggleTaskCompletion = async (taskId: number) => {
    try {
      if (!firebaseToken) throw new Error("User is not authenticated");
  
      const task = tasks.find((task) => task.id === taskId);
      if (!task) throw new Error("Task not found");
  
      setIsToggling(true); // Set isToggling to true when the action starts
  
      const url = task.completed
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/${taskId}/uncomplete`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/${taskId}/complete`;
  
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin(); // Handle token expiry and redirect to login
        } else {
          throw new Error(`Failed to ${task.completed ? "unmark" : "mark"} task as complete`);
        }
      }
  
      // Update the task locally after the request
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, completed: !task.completed, completed_at: task.completed ? null : new Date().toLocaleString() }
            : task
        )
      );
    } catch (error) {
      console.error("Error toggling task completion:", error);
    } finally {
      setIsToggling(false); // Reset isToggling when the action is finished
    }
  };
  
  const openTaskModal = (taskId: number) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      setSelectedTask(taskToEdit);
      setIsTaskModalOpen(true);
    }
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = (updatedTask: Task) => {
    if (selectedTask) {
      setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
    } else {
      setTasks([...tasks, { ...updatedTask, id: tasks.length + 1 }]);
    }
    closeTaskModal();
  };

  const deleteTask = async (taskId: number) => {
    try {
      setIsDeleting(true); // Start loading
      if (!firebaseToken) throw new Error("User is not authenticated");

      const task = tasks.find((task) => task.id === taskId);
      if (!task) throw new Error("Task not found");

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/delete/${taskId}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin(); // Handle token expiry and redirect to login
        } else {
          throw new Error("Failed to delete task");
        }
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }finally {
      setIsDeleting(false); // Reset the loading state after the operation completes
    }
  };

  const goToFocusMode = (taskId: number) => {
    router.push(`/focus?task=${taskId}`);
  };

  const renderActions = (task: Task) => (
    <div className="flex space-x-2">
      <button
        onClick={() => openTaskModal(task.id)}
        className="bg-green-500 text-white px-4 py-2 rounded"
        type="button"
        aria-label="Edit Task"
      >
        <PencilIcon className="h-5 w-5" />
      </button>

      <button
        onClick={() => toggleTaskCompletion(task.id)}
        className={`px-4 py-2 rounded ${task.completed ? "bg-red-500" : "bg-yellow-500"} ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
        type="button"
        aria-label={task.completed ? "Unmark Task as Complete" : "Mark Task as Complete"}
        disabled={isToggling} // Disable button during toggling
      >
        {task.completed ? (
          <XCircleIcon className="h-5 w-5" />
        ) : (
          <CheckCircleIcon className="h-5 w-5" />
        )}
      </button>


      <button
        onClick={() => deleteTask(task.id)}
        className={`bg-red-500 text-white px-4 py-2 rounded ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
        type="button"
        aria-label="Delete Task"
        // `disabled` is optional, if you want to completely prevent interaction
        disabled={isDeleting}
      >
          <XCircleIcon className="h-5 w-5" />
      </button>

      <button
        onClick={() => goToFocusMode(task.id)}
        className="bg-purple-500 text-white px-4 py-2 rounded flex items-center space-x-2"
        type="button"
        aria-label="Go to Focus Mode"
      >
        <EyeIcon className="h-5 w-5" />
      </button>
    </div>
  );


  if (loadingTasks) {
    return <p>Loading tasks...</p>;
  }

  return (
<div className="container mx-auto p-6">
  <div className="mt-6 inline-flex justify-between items-center">
    <button
      onClick={openNewTaskModal}
      className="px-4 py-2 rounded flex items-center space-x-2 text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
    >
      <PlusCircleIcon className="h-5 w-5" />
      <span>New Task</span>
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
  />

  <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} width="max-w-3xl">
    <TaskModal
      categories={categories}
      existingTask={selectedTask}
      onSave={handleSaveTask}
      onClose={closeTaskModal}
    />
  </Modal>
</div>
  );
};

export default TaskListPage;
