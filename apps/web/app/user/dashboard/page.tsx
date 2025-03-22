"use client";
import { Filter } from "@FrontendTypes/filter";
import { Task } from "@GlobalTypes/Task";
import Link from "next/link";
import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import TaskTable from "../../../components/TaskDisplays/TaskTable";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import Toast from "../../../components/ui/Toast";
import { useAuth } from "../../../contexts/authContext";
import { useUserSettings } from "../../../contexts/UserSettingsContext";
import TaskModal from "components/TaskCreation/TaskModal";
import TaskCompletedTimeframe from "components/UserStats/TaskCompletedTimeframe";
import { useTasks } from "@Hooks/useTasks";
import { useSubtasks } from "@Hooks/useSubtasks";
import { useCategories } from "@Hooks/useCategories";



export default function Dashboard() {
  const {userName} = useAuth(); // Get authentication status from context
  const {settings} = useUserSettings();
  const [isModalOpen, setIsTaskModalOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [colourSchemeEnabled] = useState(true);
  
  const TablecolourScheme = settings.colour_scheme
  
  const { tasks, /*error, loadingTasks,*/ setTasks, completedTasks, fetchCompletedTasksByTimeframe, loadingCompletedTasks, completedTasksError } = useTasks();
  const {subtasks} = useSubtasks(tasks);
  const { categories, /*loadingCategories, setCategories*/ } = useCategories();

  const openNewTaskModal = () => {
    setIsTaskModalOpen(true);
  };
  
  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
  };
  
  const handleSaveTask = (newTask: Task) => {
    setTasks([...tasks, { ...newTask, id: tasks.length + 1 }]);
    closeTaskModal();
  };
  
  const filter: Filter = {
    filter: "highPriority",
    minPriority: 1,
    maxPriority: 11,
    selectedCategories: [],
  }


  return (
    <div className="flex-1 p-6 overflow-y-auto">
     <h1 className="text-2xl font-semibold">Good morning, {userName}!</h1>
      <p className="text-gray-500 italic mt-2 dark:text-gray-400">&quot;Inspirational Quote of the Day&quot;</p>
      {/* Focus Mode & Add Task Buttons */}
      <div className="mt-6 flex space-x-4">
      <Link href="/user/focus">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">
          🎯 Start Focus Mode
        </button>
      </Link>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 flex items-center" 
          onClick={openNewTaskModal}
        >
          <FiPlusCircle className="mr-2" /> Add New Task
        </button>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <TaskCompletedTimeframe
          timeframe="week"
          title="Tasks Completed This Week"
          completedTasks={completedTasks}
          loadingCompletedTasks={loadingCompletedTasks}
          completedTasksError={completedTasksError}
          fetchCompletedTasksByTimeframe={fetchCompletedTasksByTimeframe}
        />
        <Card title="Upcoming Events">
          <p className="text-center">Meeting at 3PM</p>
        </Card>
        <Card title="Focus Mode Stats">
          <p className="text-center">5 hours focused today</p>
        </Card>
      </div>

      {/* Tasks Overview */}
      <div className="mt-6 w-full flex justify-center">
        <div className="max-w-[80%] min-w-[80%]">
          <h2 className="text-xl font-semibold mb-4">🔥 High Priority Tasks</h2>
          <TaskTable
            tasks={tasks}
            categories={categories}
            selectedFilter={filter}
            sortBy={"Priority"}
            colourScheme={TablecolourScheme}
            colourSchemeEnabled={colourSchemeEnabled}
            subtasks={subtasks}
          />
          <div className="flex justify-center mt-4">
            <Link href="/user/tasks">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700">
                All Tasks
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsTaskModalOpen(false)} width="max-w-3xl">
        <TaskModal onClose={() => setIsTaskModalOpen(false)} onSave={handleSaveTask} categories={categories}/>
      </Modal>

      {/* Toast Notification */}
      {isToastVisible && <Toast message="This is a notification!" onClose={() => setIsToastVisible(false)} />}
    </div>
  );
}
