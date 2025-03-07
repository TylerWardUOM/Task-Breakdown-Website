"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TaskTable from "../../components/TaskTable";
import Modal from "../../components/ui/Modal";
import TaskModal from "../../components/ui/TaskModal";
import { PlusCircleIcon } from "@heroicons/react/solid";

const TaskListPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState([
    { id: 1, title: "Task Title 1", priority: 3, dueDate: "2025-04-25", duration: 0.3, category: "Other", isCompleted: false },
    { id: 2, title: "Task Title 2", priority: 2, dueDate: "2025-04-27", duration: 0.5, category: "Work", isCompleted: false },
  ]);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const openNewTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const markTaskAsComplete = (taskId: number) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task)));
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
        onComplete={markTaskAsComplete}
        onDelete={deleteTask}
        onFocus={goToFocusMode}
      />

      {/* Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} width="max-w-3xl">
        <TaskModal existingTask={selectedTask} onSave={handleSaveTask} onClose={closeTaskModal} />
      </Modal>
    </div>
  );
};

export default TaskListPage;
