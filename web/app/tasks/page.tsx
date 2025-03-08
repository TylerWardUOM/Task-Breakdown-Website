"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskTable from "../../components/TaskTable";
import Modal from "../../components/ui/Modal";
import TaskModal from "../../components/ui/TaskModal";
import { PlusCircleIcon, PencilIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from "@heroicons/react/solid";
import { useAuth } from "../../lib/authContext";


interface RepeatInterval {
  days?: number;
  months?: number;
}

interface Task {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  due_date: string | null; // ISO 8601 string format
  importance_factor: number | null;
  repeat_interval: RepeatInterval | null;
  notes: string | null;
  completed: boolean | null;
  completed_at: string | null; // ISO 8601 string format
  created_at: string; // ISO 8601 string format
  updated_at: string; // ISO 8601 string format
  duration: number | null; // Duration in minutes
  repeated: boolean;
}

const TaskListPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  //const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: authLoading, firebaseToken,redirectToLogin} = useAuth();
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

  const openNewTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  // Function to toggle the completion status of a task
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
        }}

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

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const goToFocusMode = (taskId: number) => {
    router.push(`/focus?task=${taskId}`);
  };

  const renderActions = (task: Task) => (
    <div className="flex space-x-2">
      <button
        onClick={() => openTaskModal(task.id)}
        className="bg-green-500 text-white px-4 py-2 rounded"
        type="button"  // Ensure it's explicitly a button
        aria-label="Edit Task"  // Accessible label for screen readers
      >
        <PencilIcon className="h-5 w-5" />
      </button>

      <button
        onClick={() => toggleTaskCompletion(task.id)}
        className={`px-4 py-2 rounded ${task.completed ? "bg-red-500" : "bg-yellow-500"}`}
        type="button"  // Explicit type
        aria-label={task.completed ? "Unmark Task as Complete" : "Mark Task as Complete"} // Dynamic label based on task status
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
        type="button"  // Explicit type
        aria-label="Delete Task"  // Accessible label for screen readers
      >
        <XCircleIcon className="h-5 w-5" />
      </button>

      <button
        onClick={() => goToFocusMode(task.id)}
        className="bg-purple-500 text-white px-4 py-2 rounded flex items-center space-x-2"
        type="button"  // Explicit type
        aria-label="Go to Focus Mode"  // Accessible label for screen readers
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

  useEffect(() => {
    if (firebaseToken) {
      const fetchTasks = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/get`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${firebaseToken}`,
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              redirectToLogin(); // Handle token expiry and redirect to login
            } else {
              throw new Error("Failed to fetch tasks");
          }          }

          const data = await response.json();
          console.log(data); // Log the received data to inspect its structur
          setTasks(data);  // Directly setting raw tasks without formatting
        } catch (err) {
          console.error("Error fetching tasks:", err);
          //etError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setLoadingTasks(false);
        }
      };

      fetchTasks();
    }
  }, [firebaseToken,redirectToLogin]);

  if (loadingTasks) {
    return <p>Loading tasks...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mt-6 flex justify-between items-center">
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

      {/* TaskTable now receives colorScheme and colorSchemeEnabled */}
      <TaskTable
        tasks={tasks}  // Pass raw tasks directly
        renderActions={renderActions}  // Pass renderActions function
        colorScheme={colorScheme}  // Pass the colorScheme prop
        colorSchemeEnabled={colorSchemeEnabled}  // Pass the colorSchemeEnabled prop
      />

      <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} width="max-w-3xl">
        <TaskModal existingTask={selectedTask} onSave={handleSaveTask} onClose={closeTaskModal} />
      </Modal>
    </div>
  );
};

export default TaskListPage;
