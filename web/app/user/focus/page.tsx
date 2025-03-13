"use client";

import { useEffect, useState } from "react";
import { useFocusStore } from "../../../store/focusStore";
import TaskTable from "../../../components/TaskTable";
import useFetchCategories from "../../../hooks/useFetchCategories";
import { useUserSettings } from "../../../contexts/UserSettingsContext";
import useFetchTasks from "../../../hooks/useFetchTasks";
import { Task } from "../../../types/Task"; // Ensure Task type is correctly imported
import Modal from "../../../components/ui/Modal"; // Using your custom modal
import { CheckCircleIcon, MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/solid";
import { toggleTaskCompletionRequest } from "../../../lib/api";

export default function FocusMode({ exitFocusMode }: { exitFocusMode: () => void }) {
  const { settings } = useUserSettings();
  const { tasks, setTasks } = useFetchTasks();
  const { categories } = useFetchCategories();

  // Focus Mode State (Zustand)
  const { tasks: sessionTasks, addTask, removeTask, isRunning, timeLeft, startTimer, pauseTimer, resetTimer, tick } =
    useFocusStore();

  // UI States
  const [sortBy] = useState<string>("priority");
  const [selectedFilter] = useState({
    filter: null,
    minPriority: 1,
    maxPriority: 10,
    selectedCategories: [],
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => tick(), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, tick]);

  useEffect(() => {
    const updatedSessionTasks = sessionTasks.map(sessionTask =>
      tasks.find(task => task.id === sessionTask.id) || sessionTask
    );
    updatedSessionTasks.forEach(updatedTask => removeTask(updatedTask.id));
    updatedSessionTasks.forEach(updatedTask => addTask(updatedTask));
  }, [tasks, addTask, removeTask]);
  

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };


  const toggleTaskCompletion = async (taskId: number) => {
    try {
      const task = tasks.find((task) => task.id === taskId);
      if (!task) throw new Error("Task not found");
  
      // Call API function
      await toggleTaskCompletionRequest(taskId, task.completed);
  
      // Update main task state
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId
            ? { ...t, completed: !t.completed, completed_at: t.completed ? null : new Date().toISOString() }
            : t
        )
      );

    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };
  

  const renderActions = (task: Task) => (
<div className="flex space-x-2">
  {/* Green Tick Button for Completion Toggle */}
  <button
    onClick={() => toggleTaskCompletion(task.id)}
    className={`px-4 py-2 rounded ${task.completed ? "bg-gray-500" : "bg-green-500"}`}
    type="button"
    aria-label={task.completed ? "Unmark Task as Complete" : "Mark Task as Complete"}
  >
    <CheckCircleIcon className="h-5 w-5 text-white" />
  </button>

  {/* Minus Button for Task Removal */}
  <button
    onClick={() => removeTask(task.id)}
    className="bg-red-500 text-white px-4 py-2 rounded"
    type="button"
    aria-label="Remove Task"
  >
    <MinusCircleIcon className="h-5 w-5 text-white" />
  </button>
</div>

  );

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      {/* Timer */}
      <h1 className="text-4xl font-bold mb-4">{formatTime(timeLeft)}</h1>
      <div className="flex gap-2">
        <button 
          className="px-4 py-2 bg-green-500 rounded-md disabled:opacity-50"
          onClick={startTimer} 
          disabled={isRunning}
        >
          Start
        </button>
        <button 
          className="px-4 py-2 bg-yellow-500 rounded-md disabled:opacity-50"
          onClick={pauseTimer} 
          disabled={!isRunning}
        >
          Pause
        </button>
        <button 
          className="px-4 py-2 bg-red-500 rounded-md"
          onClick={resetTimer}
        >
          Reset
        </button>
      </div>

      {/* Focus Session Tasks */}
      <h2 className="text-2xl mt-6">Current Focus Tasks</h2>
      <div className="max-w-3xl">
      <TaskTable 
        tasks={sessionTasks} 
        categories={categories} 
        selectedFilter={selectedFilter} 
        sortBy={sortBy} 
        renderActions={renderActions}
        colourScheme={settings.colour_scheme} 
        colourSchemeEnabled={true} 
        showCompletedTasks={true}
        visibleColumns={["title", "priority",] }
      />
    </div>
      {/* Open Task Selection Modal */}
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 rounded-md"
        onClick={() => setIsTaskModalOpen(true)}
      >
        Add Tasks to Focus Session
      </button>

      {/* Task Selection Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} width="max-w-3xl">
  <h3 className="text-lg font-semibold mb-4">Select Tasks to Add</h3>

  {/* Scrollable table container */}
  <div className="max-h-[300px] overflow-y-auto">
    <TaskTable 
      tasks={tasks.filter(task => !sessionTasks.some(t => t.id === task.id))} 
      categories={categories} 
      selectedFilter={selectedFilter} 
      sortBy={sortBy} 
      renderActions={(task: Task) => (
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded" 
          onClick={() => {
            addTask(task);
            setIsTaskModalOpen(false);
          }}
          aria-label="Add Task to Session"
        >
    <PlusCircleIcon className="h-5 w-5 text-white" />
    </button>
      )}
      colourScheme={settings.colour_scheme} 
      colourSchemeEnabled={true} 
      showCompletedTasks={false} 
    />
  </div>
</Modal>


      {/* Exit button */}
      <button className="mt-6 px-4 py-2 bg-gray-700 rounded-md" onClick={exitFocusMode}>Exit Focus Mode</button>
    </div>
  );
}