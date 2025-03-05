"use client";
import { useState } from "react";
import { PlusCircleIcon } from '@heroicons/react/solid';
import Modal from "../../components/ui/Modal";
import TaskModal from "../../components/ui/TaskModal";

const WorkSessionPage = () => {
  const [tasks, setTasks] = useState<any[]>([]); // Main task list
  const [workSessionTasks, setWorkSessionTasks] = useState<any[]>([]); // Work session tasks
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [isTaskListVisible, setIsTaskListVisible] = useState(false); // Toggle visibility of the main task list

  const createNewTask = (title: string) => {
    const newTask = { id: tasks.length + 1, title, description: "", priority: 2 };
    setTasks([...tasks, newTask]);
    setWorkSessionTasks([...workSessionTasks, newTask]); // Automatically add to Work Session
  };

  const addTaskToWorkSession = (task: any) => {
    if (!workSessionTasks.some(t => t.id === task.id)) {
      setWorkSessionTasks([...workSessionTasks, task]);
    }
  };

  const removeTaskFromWorkSession = (taskId: number) => {
    setWorkSessionTasks(workSessionTasks.filter(task => task.id !== taskId));
  };

  // Move task up
  const moveTaskUp = (taskId: number) => {
    const taskIndex = workSessionTasks.findIndex(task => task.id === taskId);
    if (taskIndex > 0) {
      const newTasks = [...workSessionTasks];
      const [movedTask] = newTasks.splice(taskIndex, 1);
      newTasks.splice(taskIndex - 1, 0, movedTask);
      setWorkSessionTasks(newTasks);
    }
  };

  // Move task down
  const moveTaskDown = (taskId: number) => {
    const taskIndex = workSessionTasks.findIndex(task => task.id === taskId);
    if (taskIndex < workSessionTasks.length - 1) {
      const newTasks = [...workSessionTasks];
      const [movedTask] = newTasks.splice(taskIndex, 1);
      newTasks.splice(taskIndex + 1, 0, movedTask);
      setWorkSessionTasks(newTasks);
    }
  };

  const handleSaveTask = (newTask: any) => {
    setTasks([...tasks, newTask]);
    setWorkSessionTasks([...workSessionTasks, newTask]);
    setIsModalOpen(false); // Close modal after saving
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setIsModalOpen(true)} // Open modal on button click
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Create New Task</span>
        </button>
      </div>

      <div className="flex gap-6">
        {/* Work Session */}
        <div className="bg-gray-200 p-4 rounded-lg w-full">
          <h2 className="text-lg font-semibold mb-2">Work Session</h2>
          <div className="space-y-2">
            {workSessionTasks.map((task) => (
              <div key={task.id} className="flex justify-between items-center mb-2">
                <div className="flex-1">{task.title}</div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => moveTaskUp(task.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveTaskDown(task.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeTaskFromWorkSession(task.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setIsTaskListVisible(!isTaskListVisible)}
            className="bg-green-500 text-white px-4 py-2 rounded mt-4"
          >
            {isTaskListVisible ? "Hide Task List" : "Add Existing Task to Session"}
          </button>

          {isTaskListVisible && (
            <div className="mt-4 bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Main Task List</h3>
              {tasks.map((task) => (
                <div key={task.id} className="flex justify-between items-center mb-2">
                  <div className="flex-1">{task.title}</div>
                  <button
                    onClick={() => addTaskToWorkSession(task)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Add to Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} width="max-w-[20%]">
        <TaskModal onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} />
      </Modal>
    </div>
  );
};

export default WorkSessionPage;
