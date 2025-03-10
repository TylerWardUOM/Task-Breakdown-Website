"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskTable from "../../components/TaskTable";
import Modal from "../../components/ui/Modal";
import TaskModal from "../../components/ui/TaskModal";
import { PlusCircleIcon, PencilIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from "@heroicons/react/solid";
import { useAuth } from "../../lib/authContext";
import useFetchTasks from "../../hooks/useFetchTasks"; // Import the hook
import { Task } from "../../types/Task";
import useFetchCategories from "../../hooks/useFetchCategories";

const TaskListPage = () => {
  const { isAuthenticated, loading: authLoading, firebaseToken, redirectToLogin } = useAuth();
  const [filter, setFilter] = useState<string | null>(null); // Filter by due date or priority
  const [sortBy, setSortBy] = useState<string>("priority"); // Default sorting by priority
  const [minPriority, setMinPriority] = useState(1); // Minimum priority
  const [maxPriority, setMaxPriority] = useState(11); // Maximum priority
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);



  const router = useRouter();

  const [colorSchemeEnabled, setColorSchemeEnabled] = useState(true);
  const [colorScheme] = useState({
    overdue: "bg-red-600",        // Overdue tasks color
    lowPriority: "bg-green-200",  // Low priority color
    mediumPriority: "bg-yellow-200", // Medium priority color
    highPriority: "bg-red-200",   // High priority color
  });

  // Using the hook to fetch tasks
  const { tasks, loadingTasks, setTasks } = useFetchTasks(firebaseToken);
  const { categories, /*loadingCategories, setCategories*/ } = useFetchCategories(firebaseToken);


  const openNewTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value);
  };

  const handleMinPriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPriority(Number(e.target.value));
  };

  const handleMaxPriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPriority(Number(e.target.value));
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (loadingTasks) {
    return <p>Loading tasks...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mt-6 inline-flex justify-between items-center">
        <button onClick={openNewTaskModal} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2">
          <PlusCircleIcon className="h-5 w-5" />
          <span>New Task</span>
        </button>
        <button
          onClick={() => setColorSchemeEnabled(!colorSchemeEnabled)}
          className="bg-gray-500 text-white px-4 py-2 rounded flex items-center space-x-2"
        >
          <span>{colorSchemeEnabled ? "Disable Colors" : "Enable Colors"}</span>
        </button>
      </div>
      <div className="mt-4">
        <label htmlFor="filterBy" className="mr-2">Filter Tasks:</label>
        <select id="filterBy" onChange={handleFilterChange} value={filter || ""} className="p-2 border rounded">
          <option value="">All</option>
          <option value="thisWeek">Due This Week</option>
          <option value="Priority>7">Priority &gt; 7</option>
          <option value="priorityRange">Priority Range</option>
          <option value="overDue"> OverDue</option>
        </select>

        <label htmlFor="sortBy" className="ml-4 mr-2">Sort By:</label>
        <select id="sortBy" onChange={handleSortChange} value={sortBy} className="p-2 border rounded">
          <option value="priority">Priority</option>
          <option value="dueDate">Due Date</option>
        </select>

        <label htmlFor="Show-Completed" className="ml-4 mr-2"> Show Completed Tasks:</label>
        <input
          id="Show-Completed"
          type="checkbox"
          checked={showCompleted}
          onChange={() => setShowCompleted(!showCompleted)}
        />
      </div>
      {filter === "priorityRange" && (
        <div>
          <label>
            Min Priority: {minPriority}
            <input
              type="range"
              min="1"
              max="10"
              value={minPriority}
              onChange={handleMinPriorityChange}
            />
          </label>
          <label>
            Max Priority: {maxPriority}
            <input
              type="range"
              min="1"
              max="10"
              value={maxPriority}
              onChange={handleMaxPriorityChange}
            />
          </label>
        </div>
      )}
      <TaskTable
        tasks={tasks}
        categories={categories}
        filter={filter}
        minPriority={minPriority}
        maxPriority={maxPriority}
        sortBy={sortBy}
        renderActions={renderActions}
        colorScheme={colorScheme}
        colorSchemeEnabled={colorSchemeEnabled}
        showCompletedTasks={showCompleted}
      />

      <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} width="max-w-3xl">
        <TaskModal categories={categories} existingTask={selectedTask} onSave={handleSaveTask} onClose={closeTaskModal} />
      </Modal>
    </div>
  );
};

export default TaskListPage;
