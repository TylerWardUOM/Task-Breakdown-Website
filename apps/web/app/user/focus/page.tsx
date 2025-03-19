"use client";

import { Filter } from "@FrontendTypes/filter";
import { Task } from "@GlobalTypes/Task";
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, CogIcon, PlusCircleIcon } from "@heroicons/react/solid";
import useFetchCategories from "@Hooks/useFetchCategories";
import useFetchTasks from "@Hooks/useFetchTasks";
import { toggleTaskCompletionRequest } from "@lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import TaskTable from "../../../components/TaskTable";
import FilterMenu from "../../../components/ui/FilterMenu";
import Modal from "../../../components/ui/Modal";
import { useUserSettings } from "../../../contexts/UserSettingsContext";
import { useFocusStore } from "../../../store/focusStore";



interface TimerSettings{
    pomodoro: number,
    shortBreak: number,
    longBreak: number,
    autoStartBreaks: boolean,
    autoStartPomodoros: boolean,
    longBreakInterval: number,
}


export default function FocusMode2() {
  const { settings } = useUserSettings();
  const { tasks, setTasks } = useFetchTasks();
  const { categories } = useFetchCategories();
  const [selectedFilter, setSelectedFilter] = useState<Filter>({
    filter: null,
    minPriority: 1,
    maxPriority: 10,
    selectedCategories: [],
  });
  const { tasks: sessionTasks, addTask, removeTask, isRunning, timeLeft, startTimer, pauseTimer, resetTimer, tick } =
    useFocusStore();

  const [sortBy] = useState<string>("priority");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof TimerSettings>("pomodoro");
  const breakTimes = { pomodoro: 1500, shortBreak: 300, longBreak: 900 };
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    longBreakInterval: 4,
    });

  
  // When Settings Change, Update Time
  useEffect(() => {
    resetTimer((timerSettings[activeTab] as number) * 60);
    }, [timerSettings, activeTab, resetTimer]);
  

  const handleFilterChange = (filters: {
    filter: string | null;
    minPriority: number;
    maxPriority: number;
    selectedCategories: number[];
  }) => {
    setSelectedFilter(filters);
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
 {/* Toggle Completion Button */}
 <button
    onClick={() => toggleTaskCompletion(task.id)}
    className={`relative flex items-center justify-center w-10 h-10 rounded transition border-2 group
      ${task.completed ? "bg-green-500 border-green-500 text-white hover:bg-red-500 hover:border-red-500" 
      : "border-gray-400 text-gray-500 hover:bg-green-500 hover:border-green-500 hover:text-white"}`}
    type="button"
    aria-label={task.completed ? "Unmark Task as Complete" : "Mark Task as Complete"}
  >
    {/* Tooltip */}
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
      {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
    </span>

    {/* Show tick when completed, X on hover */}
    {task.completed ? (
      <>
        <CheckCircleIcon className="h-5 w-5 group-hover:hidden" />
        <XCircleIcon className="h-5 w-5 hidden group-hover:block" />
      </>
    ) : (
      <CheckCircleIcon className="h-5 w-5" />
    )}
  </button>

    
      {/* Minus Button for Task Removal */}
      <button
        onClick={() => removeTask(task.id)}
        className={`relative flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded transition hover:bg-red-600 group`}
        type="button"
        aria-label="Remove Task From Session"
      >
        <MinusCircleIcon className="h-5 w-5 text-white" />
            {/* Tooltip */}
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
    Remove From Session
    </span>
      </button>
    </div>
  )

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
  
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col items-center justify-center p-6">
  <div className="mt-4 p-6 bg-gray-800 rounded-lg w-full max-w-md text-center flex flex-col items-center relative">
    
    {/* Settings Cog - Positioned Top Right */}
    <button 
      className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-400"
      onClick={() => setIsSettingsModalOpen(true)}
      aria-label="Open Timer Settings"
    >
      <CogIcon className="h-6 w-6" />
    </button>

    {/* Timer Tabs */}
    <div className="flex gap-4 mb-3">
      {Object.keys(breakTimes).map(tab => (
        <button
          key={tab}
          className={`px-4 py-2 rounded-md ${activeTab === tab ? "bg-gray-700" : "bg-gray-800"}`}
          onClick={() => {
            setActiveTab(tab as "pomodoro" | "shortBreak" | "longBreak");
            resetTimer();
          }}
        >
          {tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        </button>
      ))}
    </div>

    {/* Timer Display */}
    <h1 className="text-6xl font-bold mb-3">{formatTime(timeLeft)}</h1>

    {/* Timer Controls */}
    <div className="mt-3 flex gap-4">
      <button className="px-4 py-2 bg-green-500 rounded-md disabled:opacity-50" onClick={startTimer} disabled={isRunning}>
        Start
      </button>
      <button className="px-4 py-2 bg-yellow-500 rounded-md disabled:opacity-50" onClick={pauseTimer} disabled={!isRunning}>
        Pause
      </button>
      <button className="px-4 py-2 bg-red-500 rounded-md" onClick={() => resetTimer((timerSettings[activeTab] as number) * 60)}>
        Reset
      </button>
    </div>
  </div>
           {/* Focus Session Tasks */}
      <h2 className="text-2xl mt-6">Current Focus Tasks</h2>
      <div className="bg-gray-900 w-full max-w-md text-center flex flex-col items-center">
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
      
      
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 rounded-md"
        onClick={() => setIsTaskModalOpen(true)}
      >
       Add Task to Session
      </button>

      <Modal isOpen={isTaskModalOpen} onClose={() => {setIsTaskModalOpen(false); setSelectedFilter({
    filter: null,
    minPriority: 1,
    maxPriority: 10,
    selectedCategories: [],
  })}} width="max-w-3xl">
        <div className="flex gap-4">
        <h3 className="text-lg font-semibold mb-4">Select a Task</h3>
        <FilterMenu categories={categories} onFilterChange={handleFilterChange} />
        </div>
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
                  setIsTaskModalOpen(false);
                  addTask(task);
                }}
                aria-label="Select Task"
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

  {/* Settings Modal */}
  <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} width="max-w-md" maxHeight="max-h-[70vh]">
    <h3 className="text-lg font-semibold mb-4">Settings</h3>

                 {/* Timer Settings */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">Customize Timer Durations</h4>

          {(["pomodoro", "shortBreak", "longBreak"] as const).map((type) => (
            <div key={type} className="mb-3">
              <label htmlFor={type} className="block text-sm font-medium">
                {type.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} (minutes)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                id={type}
                className="bg-gray-700 rounded p-2 w-full"
                value={timerSettings[type]}
                onChange={(e) => setTimerSettings((prev) => ({ ...prev, [type]: Number(e.target.value) }))}
              />
            </div>
          ))}

          {/* Auto-Start Toggles */}
<div className="flex justify-between items-center mt-2">
  <label htmlFor="autoStartBreaks">Auto Start Breaks</label>
  <input
    id="autoStartBreaks"
    type="checkbox"
    className="form-checkbox h-5 w-5 text-blue-500"
    checked={timerSettings.autoStartBreaks}
    onChange={() =>
      setTimerSettings((prev) => ({ ...prev, autoStartBreaks: !prev.autoStartBreaks }))
    }
  />
</div>

<div className="flex justify-between items-center mt-2">
  <label htmlFor="autoStartPomodoros">Auto Start Pomodoros</label>
  <input
    id="autoStartPomodoros"
    type="checkbox"
    className="form-checkbox h-5 w-5 text-blue-500"
    checked={timerSettings.autoStartPomodoros}
    onChange={() =>
      setTimerSettings((prev) => ({ ...prev, autoStartPomodoros: !prev.autoStartPomodoros }))
    }
  />
</div>

{/* Long Break Interval */}
<div className="mt-4">
  <label htmlFor="longBreakInterval" className="block text-sm font-medium">
    Long Break Interval (Pomodoros)
  </label>
  <input
    id="longBreakInterval"
    type="number"
    min="1"
    step="1"
    className="bg-gray-700 rounded p-2 w-full"
    value={timerSettings.longBreakInterval}
    onChange={(e) =>
      setTimerSettings((prev) => ({ ...prev, longBreakInterval: Number(e.target.value) }))
    }
  />
</div>
</div>
{/* Sound Settings */}
<div className="bg-gray-800 p-4 rounded-lg mb-4">
  <h4 className="font-semibold mb-2">Sound Settings</h4>

  <label htmlFor="alarmSound">Alarm Sound</label>
  <select id="alarmSound" className="bg-gray-700 rounded p-2 w-full">
    <option>Bell</option>
    <option>Bird</option>
    <option>Digital</option>
    <option>Kitchen</option>
    <option>Wood</option>
  </select>

  <label htmlFor="tickingSound">Ticking Sound</label>
  <select id="tickingSound" className="bg-gray-700 rounded p-2 w-full">
    <option>None</option>
    <option>Ticking Fast</option>
    <option>Ticking Slow</option>
    <option>White Noise</option>
    <option>Brown Noise</option>
  </select>

  <label htmlFor="volume">Volume</label>
  <input id="volume" type="range" min="0" max="100" className="w-full" />
</div>

{/* Notification Settings */}
<div className="bg-gray-800 p-4 rounded-lg">
  <h4 className="font-semibold mb-2">Notification Settings</h4>

  <div className="flex justify-between items-center">
    <label htmlFor="reminderInterval">Reminder Interval (minutes)</label>
    <input
      id="reminderInterval"
      type="number"
      min="1"
      step="1"
      className="bg-gray-700 rounded p-2 w-16"
      value="5"
    />
  </div>

  <div className="flex justify-between items-center mt-2">
    <label htmlFor="enableMobileAlarm">Enable Mobile Alarm</label>
    <input id="enableMobileAlarm" type="checkbox" className="form-checkbox h-5 w-5 text-blue-500" />
  </div>
</div>
  </Modal>
      <Link href={"/user/dashboard"}>
      <button className="mt-6 px-4 py-2 bg-gray-700 rounded-md">Exit Focus Mode</button>
      </Link>
    </div>
  );
}
