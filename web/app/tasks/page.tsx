"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskTable from "../../components/TaskTable";
import Modal from "../../components/ui/Modal";
import TaskModal from "../../components/ui/TaskModal";
import { PlusCircleIcon } from "@heroicons/react/solid";
import { useAuth } from "../../lib/authContext";

const TaskListPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: authLoading, firebaseToken } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const router = useRouter();

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
        ? `http://localhost:5000/api/tasks/${taskId}/uncomplete`
        : `http://localhost:5000/api/tasks/${taskId}/complete`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${task.completed ? "unmark" : "mark"} task as complete`);
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

  const handleSaveTask = (updatedTask: any) => {
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (firebaseToken) {
      const fetchTasks = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/tasks/get", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${firebaseToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch tasks");
          }

          const data = await response.json();

          const formattedTasks = data.map((task: any) => ({
            id: task.id,
            user_id: task.user_id ?? "Unknown",
            category_id: task.category_id ?? "Uncategorized",
            title: task.title || "Untitled Task",
            description: task.description || "No description available",
            due_date: task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date",
            importance_factor: task.importance_factor || 0,
            duration: task.duration ? formatInterval(task.duration) : "No duration set",
            repeat_interval: task.repeat_interval ? formatInterval(task.repeat_interval) : "No repeat",
            notes: task.notes || "",
            completed: task.completed || false,
            completed_at: task.completed_at ? new Date(task.completed_at).toLocaleString() : null,
          }));

          setTasks(formattedTasks);
        } catch (err) {
          console.error("Error fetching tasks:", err);
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setLoadingTasks(false);
        }
      };

      fetchTasks();
    }
  }, [firebaseToken]);

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
      </div>

      <TaskTable
        tasks={tasks}
        onEdit={openTaskModal}
        onComplete={toggleTaskCompletion} // Update to use toggleTaskCompletion
        onDelete={deleteTask}
        onFocus={goToFocusMode}
      />

      <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} width="max-w-3xl">
        <TaskModal existingTask={selectedTask} onSave={handleSaveTask} onClose={closeTaskModal} />
      </Modal>
    </div>
  );
};

export default TaskListPage;

/**
 * Helper function to format PostgreSQL INTERVAL data
 */
const formatInterval = (interval: any): string => {
  if (typeof interval === "string") {
    return interval;
  } else if (typeof interval === "object" && interval.minutes !== undefined) {
    return `${interval.minutes}m ${interval.seconds || 0}s`;
  } else if (typeof interval === "object" && interval.days !== undefined) {
    return `${interval.days} days`;
  }
  return "Invalid interval";
};
