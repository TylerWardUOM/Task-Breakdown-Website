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

const TaskListPage = () => {
  const { isAuthenticated, loading: authLoading, firebaseToken, redirectToLogin } = useAuth();
  const [filter, setFilter] = useState<string | null>(null); // Filter by due date or priority
  const [sortBy, setSortBy] = useState<string>("priority"); // Default sorting by priority
  const [minPriority, setMinPriority] = useState(1); // Minimum priority
  const [maxPriority, setMaxPriority] = useState(11); // Maximum priority
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
        className={`px-4 py-2 rounded ${task.completed ? "bg-red-500" : "bg-yellow-500"}`}
        type="button"
        aria-label={task.completed ? "Unmark Task as Complete" : "Mark Task as Complete"}
      >
        {task.completed ? (
          <XCircleIcon className="h-5 w-5" />
        ) : (
          <CheckCircleIcon className="h-5 w-5" />
        )}
      </button>

      <button
        onClick={() => deleteTask(task.id)}
        className="bg-red-500 text-white px-4 py-2 rounded"
        type="button"
        aria-label="Delete Task"
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
          <option value="highPriority">Priority &gt; 7</option>
          <option value="priorityRange">Priority Range</option>
          <option value="overDue"> OverDue</option>
        </select>

        <label htmlFor="sortBy" className="ml-4 mr-2">Sort By:</label>
        <select id="sortBy" onChange={handleSortChange} value={sortBy} className="p-2 border rounded">
          <option value="priority">Priority</option>
          <option value="dueDate">Due Date</option>
        </select>
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
        filter={filter}
        minPriority={minPriority}
        maxPriority={maxPriority}
        sortBy={sortBy}
        renderActions={renderActions}
        colorScheme={colorScheme}
        colorSchemeEnabled={colorSchemeEnabled}
      />

      <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} width="max-w-3xl">
        <TaskModal existingTask={selectedTask} onSave={handleSaveTask} onClose={closeTaskModal} />
      </Modal>
    </div>
  );
};

export default TaskListPage;
