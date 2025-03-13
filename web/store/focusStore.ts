import { create } from "zustand";
import { Task } from "../types/Task";

interface FocusState {
  tasks: Task[]; // Selected tasks for focus mode
  isRunning: boolean;
  timeLeft: number; // Time in seconds
  isBreak: boolean; // Indicates if in break mode

  addTask: (task: Task) => void;
  removeTask: (taskId: number) => void;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
}

export const useFocusStore = create<FocusState>((set) => ({
  tasks: [],
  isRunning: false,
  timeLeft: 25 * 60, // Default Pomodoro: 25 min
  isBreak: false, // Work session by default

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

  resetTimer: () =>
    set({
      timeLeft: 25 * 60, // Reset to 25 min
      isRunning: false,
      isBreak: false,
    }),

  tick: () =>
    set((state) => {
      if (state.timeLeft > 0) {
        return { timeLeft: state.timeLeft - 1 };
      } else {
        // Auto-switch to break mode when work session ends
        return state.isBreak
          ? { timeLeft: 25 * 60, isBreak: false, isRunning: false } // Back to work
          : { timeLeft: 5 * 60, isBreak: true, isRunning: false }; // Start break
      }
    }),
}));
