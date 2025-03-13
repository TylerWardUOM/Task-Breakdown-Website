"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFocusStore } from "../../../store/focusStore";
import TaskTable from "../../../components/TaskTable";
import useFetchCategories from "../../../hooks/useFetchCategories";
import { useUserSettings } from "../../../contexts/UserSettingsContext";
import useFetchTasks from "../../../hooks/useFetchTasks";
import { Task } from "../../../types/Task"; // Ensure Task type is correctly imported
import Modal from "../../../components/ui/Modal"; // Using your custom modal

export default function FocusMode({ exitFocusMode }: { exitFocusMode: () => void }) {
  const { settings } = useUserSettings();
  const { tasks } = useFetchTasks();
  const { categories } = useFetchCategories();
  const router = useRouter();

  // Focus Mode State (Zustand)
  const { tasks: sessionTasks, addTask, removeTask, isRunning, timeLeft, startTimer, pauseTimer, resetTimer, tick } =
    useFocusStore();

  // UI States
  const [sortBy, setSortBy] = useState<string>("priority");
  const [showCompleted, setShowCompleted] = useState(false);
  const [colourSchemeEnabled, setColourSchemeEnabled] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState({
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

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

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
      <TaskTable 
        tasks={sessionTasks} 
        categories={categories} 
        selectedFilter={selectedFilter} 
        sortBy={sortBy} 
        renderActions={(task: Task) => (
          <button className="text-red-500" onClick={() => removeTask(task.id)}>Remove</button>
        )}
        colourScheme={settings.colour_scheme} 
        colourSchemeEnabled={colourSchemeEnabled} 
        showCompletedTasks={showCompleted} 
      />

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
        <TaskTable 
          tasks={tasks.filter(task => !sessionTasks.some(t => t.id === task.id))} 
          categories={categories} 
          selectedFilter={selectedFilter} 
          sortBy={sortBy} 
          renderActions={(task: Task) => (
            <button 
              className="text-green-500" 
              onClick={() => {
                addTask(task);
                setIsTaskModalOpen(false);
              }}
            >
              Add
            </button>
          )}
          colourScheme={settings.colour_scheme} 
          colourSchemeEnabled={colourSchemeEnabled} 
          showCompletedTasks={showCompleted} 
        />
      </Modal>

      {/* Exit button */}
      <button className="mt-6 px-4 py-2 bg-gray-700 rounded-md" onClick={exitFocusMode}>Exit Focus Mode</button>
    </div>
  );
}
