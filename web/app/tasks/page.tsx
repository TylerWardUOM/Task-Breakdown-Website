"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "../../components/ui/Modal";
import TaskModal from "../../components/ui/TaskModal";
import { PencilIcon, CheckCircleIcon, XCircleIcon, EyeIcon, PlusCircleIcon } from '@heroicons/react/solid';

const TaskListPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Task Title 1",
      priority: 3,
      dueDate: "2025-04-25",
      duration: 0.3,
      description: "Hello how u",
      importance: 2,
      repeatTask: "Weekly",
      category: "Other",
      isCompleted: false,
    },
    {
      id: 2,
      title: "Task Title 2",
      priority: 2,
      dueDate: "2025-04-27",
      duration: 0.5,
      category: "Work",
      isCompleted: false,
    },
  ]);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isPriorityGradient, setIsPriorityGradient] = useState(true);

  const [workSessionTasks, setWorkSessionTasks] = useState<any[]>([]); // Temporary work session tasks
  const [isWorkSessionCreated, setIsWorkSessionCreated] = useState(false); // To track if Work Session has been created

  const openNewTaskModal = () => {
    setSelectedTask(null); // Reset selected task for new task creation
    setIsTaskModalOpen(true);
  };

  const markTaskAsComplete = (taskId: number) => {
    setTasks(tasks.map((task) =>
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    ));
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
      setTasks(tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      ));
    } else {
      const newTask = { ...updatedTask, id: tasks.length + 1 };
      setTasks([...tasks, newTask]);
    }
    closeTaskModal();
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const goToFocusMode = (taskId: number) => {
    router.push(`/focus?task=${taskId}`);
  };

  const getPriorityColor = (priority: number) => {
    if (isPriorityGradient) {
      switch (priority) {
        case 1:
          return "bg-green-200"; // Low priority - green
        case 2:
          return "bg-yellow-300"; // Medium priority - yellow
        case 3:
          return "bg-red-400"; // High priority - red
        default:
          return "bg-gray-300"; // Default
      }
    }
    return ""; // No gradient if disabled
  };

  const addToWorkSession = (task: any) => {
    // Adds the task to the work session list
    setWorkSessionTasks((prevTasks) => [...prevTasks, task]);
  };

  const removeFromWorkSession = (taskId: number) => {
    // Removes the task from the work session list
    setWorkSessionTasks(workSessionTasks.filter((task) => task.id !== taskId));
  };

  const clearWorkSession = () => {
    setWorkSessionTasks([]); // Clears all tasks in work session
    setIsWorkSessionCreated(false); // Reset work session creation state
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mt-6 flex justify-between items-center">
        <div className="flex space-x-4">
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Filter</button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Sort by</button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Group by Category/Tag</button>
          <div className="flex items-center space-x-2">
            <label className="text-sm">Priority Gradient:</label>
            <input
              type="checkbox"
              checked={isPriorityGradient}
              onChange={() => setIsPriorityGradient(!isPriorityGradient)}
              className="cursor-pointer"
            />
          </div>
        </div>
        <button
          onClick={openNewTaskModal}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Work Session Box */}
      {!isWorkSessionCreated ? (
        <button
          onClick={() => setIsWorkSessionCreated(true)}
          className="bg-green-500 text-white px-4 py-2 rounded mt-4 flex items-center space-x-2"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Create Work Session</span>
        </button>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg mt-4">
          <h3 className="text-xl font-semibold">Work Session</h3>
          <button
            onClick={clearWorkSession}
            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
          >
            Clear Session
          </button>
          <div className="mt-4">
            {workSessionTasks.length > 0 ? (
              <ul className="list-none">
                {workSessionTasks.map((task, index) => (
                  <li key={task.id} className="p-2 my-2 bg-gray-200 rounded">
                    <div className="flex justify-between items-center">
                      <span>{index + 1}. {task.title}</span>
                      <button
                        onClick={() => removeFromWorkSession(task.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No tasks in the current session.</p>
            )}
          </div>
        </div>
      )}

      {/* Task Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg mt-4">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Task Title</th>
              <th className="py-2 px-4 text-left">Priority</th>
              <th className="py-2 px-4 text-left">Due Date</th>
              <th className="py-2 px-4 text-left">Category</th>
              <th className="py-2 px-4 text-left">Duration</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className={`${getPriorityColor(task.priority)} ${task.isCompleted ? 'opacity-50' : ''}`}>
                <td className="py-2 px-4">
                  <span className={task.isCompleted ? "line-through text-gray-400" : ""}>
                    {task.title}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center">
                    {[...Array(task.priority)].map((_, index) => (
                      <span key={index} className="text-yellow-500">★</span>
                    ))}
                  </div>
                </td>
                <td className="py-2 px-4">{task.dueDate}</td>
                <td className="py-2 px-4">{task.category}</td>
                <td className="py-2 px-4">{task.duration} hours</td>
                <td className="py-2 px-4 flex space-x-2">
                  <button
                    onClick={() => openTaskModal(task.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => markTaskAsComplete(task.id)}
                    className={`px-4 py-2 rounded ${task.isCompleted ? "bg-red-500" : "bg-yellow-500"}`}
                  >
                    {task.isCompleted ? (
                      <XCircleIcon className="h-5 w-5" />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => goToFocusMode(task.id)}
                    className="bg-purple-500 text-white px-4 py-2 rounded flex items-center space-x-2"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => addToWorkSession(task)} // Adds task to session
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Add to Session
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} width="max-w-3xl">
        <TaskModal
          task={selectedTask}
          onSave={handleSaveTask}
          onCancel={closeTaskModal}
        />
      </Modal>
    </div>
  );
};

export default TaskListPage;
