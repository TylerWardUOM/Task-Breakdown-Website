"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SubtaskInput from "../../components/ui/SubtaskInput";
import Modal from "../../components/ui/Modal";
import TaskModal from "../../components/ui/TaskModal";
import { PencilIcon, CheckCircleIcon, XCircleIcon, EyeIcon, PlusCircleIcon } from '@heroicons/react/solid'; // Import Heroicons

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
      subtasks: [
        {
          id: 1,
          title: "Subtask 1",
          description: "yo",
          priority: 1,
          duration: 25,
          importance: 6,
          dependency: "",
          isCompleted: false,
        },
        {
          id: 2,
          title: "Subtask 2",
          description: "yo",
          priority: 4,
          duration: 40,
          importance: 8,
          dependency: "",
          isCompleted: false,
        },
      ],
      isExpanded: false,
    },
    {
      id: 2,
      title: "Task Title 2",
      priority: 2,
      dueDate: "2025-04-27",
      duration: 0.5,
      category: "Work",
      isCompleted: false,
      subtasks: [],
      isExpanded: false,
    },
  ]);

  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const toggleExpand = (taskId: number) => {
    setTasks(tasks.map((task) =>
      task.id === taskId ? { ...task, isExpanded: !task.isExpanded } : task
    ));
  };

  const addSubtask = (newSubtask: any) => {
    if (selectedTaskId !== null) {
      setTasks(tasks.map((task) =>
        task.id === selectedTaskId ? {
          ...task,
          subtasks: [...task.subtasks, newSubtask],
        } : task
      ));
    }
  };

  const markTaskAsComplete = (taskId: number) => {
    setTasks(tasks.map((task) =>
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  const markSubtaskAsComplete = (taskId: number, subtaskId: number) => {
    setTasks(tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map((subtask) =>
              subtask.id === subtaskId
                ? { ...subtask, isCompleted: !subtask.isCompleted }
                : subtask
            ),
          }
        : task
    ));
  };

  const openSubtaskModal = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsSubtaskModalOpen(true);
  };

  const openTaskModal = (taskId: number) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      setSelectedTask(taskToEdit);
      setIsTaskModalOpen(true);
    }
  };

  const closeSubtaskModal = () => {
    setIsSubtaskModalOpen(false);
    setSelectedTaskId(null);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const getNextSubtaskId = (taskId: number): number => {
    const task = tasks.find((task) => task.id === taskId);
    if (task && task.subtasks.length > 0) {
      return Math.max(...task.subtasks.map((subtask) => subtask.id)) + 1;
    }
    return 1; 
  };

  const handleSaveTask = (updatedTask: any) => {
    setTasks(tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    ));
    closeTaskModal();
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const deleteSubtask = (taskId: number, subtaskId: number) => {
    setTasks(tasks.map((task) =>
      task.id === taskId
        ? { ...task, subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId) }
        : task
    ));
  };

  const goToFocusMode = (taskId: number, subtaskId?: number) => {
    router.push(`/focus?task=${taskId}${subtaskId ? `&subtask=${subtaskId}` : ""}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mt-6 flex justify-between items-center">
        <div className="flex space-x-4">
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Filter</button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Sort by</button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Group by Category/Tag</button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
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
              <>
                <tr key={task.id}>
                  <td className="py-2 px-4 flex items-center">
                    <span className={task.isCompleted ? "line-through text-gray-400" : ""}>
                      {task.title}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">({task.subtasks.length} subtasks)</span>
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
                      onClick={() => toggleExpand(task.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
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
                      onClick={() => openSubtaskModal(task.id)}
                      className="bg-indigo-500 text-white px-4 py-2 rounded"
                    >
                      <PlusCircleIcon className="h-5 w-5" />
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
                  </td>
                </tr>

                {task.isExpanded && task.subtasks.map((subtask) => (
                  <tr key={subtask.id}>
                    <td className="py-2 px-4 pl-12">
                      <span className={subtask.isCompleted ? "line-through text-gray-400" : ""}>
                        {subtask.title}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        {[...Array(subtask.priority)].map((_, index) => (
                          <span key={index} className="text-yellow-500">★</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-4">-</td>
                    <td className="py-2 px-4">-</td>
                    <td className="py-2 px-4">{subtask.duration} minutes</td>
                    <td className="py-2 px-4 flex space-x-2">
                      {/* Edit Subtask Button (Non-functional for now) */}
                      <button className="bg-green-500 text-white px-4 py-2 rounded">
                        <PencilIcon className="h-5 w-5" />
                      </button>

                      {/* Complete/Incomplete Toggle Button */}
                      <button
                        onClick={() => markSubtaskAsComplete(task.id, subtask.id)}
                        className={`px-4 py-2 rounded ${subtask.isCompleted ? "bg-red-500" : "bg-yellow-500"}`}
                      >
                        {subtask.isCompleted ? (
                          <XCircleIcon className="h-5 w-5" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5" />
                        )}
                      </button>

                      {/* Delete Subtask Button */}
                      <button
                        onClick={() => deleteSubtask(task.id, subtask.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => goToFocusMode(task.id, subtask.id)}
                        className="bg-purple-500 text-white px-4 py-2 rounded flex items-center space-x-2"
                        >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isSubtaskModalOpen} onClose={closeSubtaskModal} width="max-w-[20%]">
        <h2 className="text-xl font-semibold mb-4">Add Subtask</h2>
        <SubtaskInput
          onAddSubtask={addSubtask}
          nextId={getNextSubtaskId(selectedTaskId as number)}
        />
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} width="max-w-[20%]">
        <TaskModal
          onClose={closeTaskModal}
          onSave={handleSaveTask}
          existingTask={selectedTask}
        />
      </Modal>
    </div>
  );
};

export default TaskListPage;
