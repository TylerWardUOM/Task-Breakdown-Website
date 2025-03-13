import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Task } from "../types/Task";

interface FocusState {
  tasks: Task[];
  isRunning: boolean;
  timeLeft: number;
  isBreak: boolean;
  addTask: (task: Task) => void;
  removeTask: (taskId: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set) => ({
      tasks: [],
      isRunning: false,
      timeLeft: 25 * 60,
      isBreak: false,
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),
      removeTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),
      startTimer: () => set({ isRunning: true }),
      pauseTimer: () => set({ isRunning: false }),
      resetTimer: () => set({ timeLeft: 25 * 60, isRunning: false, isBreak: false }),
      tick: () =>
        set((state) => ({
          timeLeft: state.timeLeft > 0 ? state.timeLeft - 1 : 0,
        })),
    }),
    {
        name: "focus-store", // Storage key
        storage: createJSONStorage(() => localStorage), // ✅ Correct way to persist state
      }
  )
);
