import { create } from "zustand";
import { Task } from "../types/Task";

interface FocusState {
  tasks: Task[]; // Selected tasks for focus mode
  isRunning: boolean;
  timeLeft: number; // Time in seconds
  isBreak: boolean; // Indicates if in break mode

  // Timer settings
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // How many pomodoros before a long break
  pomodoroCount: number; // Tracks completed pomodoros

  addTask: (task: Task) => void;
  removeTask: (taskId: number) => void;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (newTime?: number) => void;
  tick: () => void;
  updateSettings: (settings: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
  }) => void;
}

export const useFocusStore = create<FocusState>((set) => ({
  tasks: [],
  isRunning: false,
  timeLeft: 25 * 60, // Default Pomodoro: 25 min
  isBreak: false, // Work session by default
  pomodoroDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  longBreakInterval: 4,
  pomodoroCount: 0,

  addTask: (task: Task) =>
    set((state) => {
      if (state.tasks.some((t) => t.id === task.id)) return state; // Prevent duplicates
      return { tasks: [...state.tasks, task] };
    }),

  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),

  startTimer: () => set({ isRunning: true }),
  pauseTimer: () => set({ isRunning: false }),

  resetTimer: (newTime?: number) =>
    set((state) => ({
      timeLeft: newTime !== undefined ? newTime : state.pomodoroDuration,
      isRunning: false,
      isBreak: false,
    })),

  tick: () =>
    set((state) => {
      if (state.timeLeft > 0) {
        return { timeLeft: state.timeLeft - 1 };
      } else {
        // Auto-switch between work & break modes
        if (!state.isBreak) {
          const nextPomodoroCount = state.pomodoroCount + 1;
          const isLongBreak = nextPomodoroCount % state.longBreakInterval === 0;
          return {
            timeLeft: isLongBreak ? state.longBreakDuration : state.shortBreakDuration,
            isBreak: true,
            isRunning: false,
            pomodoroCount: nextPomodoroCount,
          };
        } else {
          return {
            timeLeft: state.pomodoroDuration,
            isBreak: false,
            isRunning: false,
          };
        }
      }
    }),

  updateSettings: (settings) =>
    set(() => ({
      pomodoroDuration: settings.pomodoro * 60,
      shortBreakDuration: settings.shortBreak * 60,
      longBreakDuration: settings.longBreak * 60,
      longBreakInterval: settings.longBreakInterval,
    })),
}));
