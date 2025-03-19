"use client";
import { useState } from "react";
import { Task, Subtask } from "@GlobalTypes/Task";
import { Filter } from "@FrontendTypes/filter";
import useFetchCategories from "@Hooks/useFetchCategories";
import useFetchTasks from "@Hooks/useFetchTasks";
import useSubtasksByTaskIds from "@Hooks/useSubtasksByTaskIds";
import { toggleTaskCompletionRequest, deleteTaskRequest } from "@lib/api";
import { useUserSettings } from "../web/contexts/UserSettingsContext";

export const useTaskPage = () => {
  const { settings } = useUserSettings();
  const [sortBy, setSortBy] = useState<string>("priority");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAITaskModalOpen, setIsAITaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSubtasks, setSelectedSubtasks] = useState<Subtask[] | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Filter>({
    filter: null,
    minPriority: 1,
    maxPriority: 10,
    selectedCategories: [],
  });

  const [colourSchemeEnabled, setcolourSchemeEnabled] = useState(true);
  const colourScheme = settings.colour_scheme;

  // Fetching tasks, subtasks, and categories
  const { tasks, loadingTasks, setTasks } = useFetchTasks();
  const { subtasks, setSubtasks } = useSubtasksByTaskIds(tasks);
  const { categories } = useFetchCategories();

  const handleFilterChange = (filters: Filter) => setSelectedFilter(filters);

  const openNewTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
  };

  const toggleTaskCompletion = async (taskId: number) => {
    try {
      const task = tasks.find((task) => task.id === taskId);
      if (!task) throw new Error("Task not found");
  
      setIsToggling(true); // Start loading state
  
      // Call API function
      await toggleTaskCompletionRequest(taskId, task.completed);
  
      // Update local state after successful API call
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId
            ? { ...t, completed: !t.completed, completed_at: t.completed ? null : new Date().toLocaleString() }
            : t
        )
      );
    } catch (error) {
      console.error("Error toggling task completion:", error);
    } finally {
      setIsToggling(false); // Reset loading state
    }
  };
  
  
  const openTaskModal = (taskId: number) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      setSelectedTask(taskToEdit);
      const taskToEdit_Subtasks = subtasks.filter((subtask) => subtask.task_id === taskToEdit.id)
      if (taskToEdit_Subtasks.length>0){
        setSelectedSubtasks(taskToEdit_Subtasks);
      }
      setIsTaskModalOpen(true);
    }
  };

  const openAITaskModal = () =>{
    setIsAITaskModalOpen(true)
  }

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    setSelectedSubtasks(null);
  };

  const closeAITaskModal = () => {
    setIsAITaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = (updatedTask: Task) => {
    if (selectedTask) {
      setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
    } else {
    setTasks([...tasks, updatedTask]);
    }
    closeTaskModal();
  };

  const handleSaveAITask = (savedData: { task: Task; subtasks: Subtask[] }) => {
    if (savedData) {
      // Update task list
      setTasks([...tasks, savedData.task]);
  
      // Update subtasks list with the newly saved subtasks
      const updatedSubtasks = [...subtasks, ...savedData.subtasks];
      setSubtasks(updatedSubtasks);
  
      closeAITaskModal();
    }
  };
  

const deleteTask = async (taskId: number) => {
  try {
    setIsDeleting(true); // Start loading

    const task = tasks.find((task) => task.id === taskId);
    if (!task) throw new Error("Task not found");

    // Call API function
    await deleteTaskRequest(taskId);

    // Update local state after successful API call
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  } catch (error) {
    console.error("Error deleting task:", error);
  } finally {
    setIsDeleting(false); // Reset loading state
  }
};



  return {
    settings,
    tasks,
    subtasks,
    categories,
    loadingTasks,
    sortBy,
    isTaskModalOpen,
    isAITaskModalOpen,
    selectedTask,
    selectedSubtasks,
    isDeleting,
    isToggling,
    showCompleted,
    selectedFilter,
    colourSchemeEnabled,
    handleFilterChange,
    handleSortChange,
    toggleTaskCompletion,
    openTaskModal,
    closeTaskModal,
    handleSaveTask,
    handleSaveAITask,
    deleteTask,
    setIsAITaskModalOpen,
    openNewTaskModal,
    setShowCompleted,
    openAITaskModal,
    setcolourSchemeEnabled,
    colourScheme,
    closeAITaskModal,
  };
};
