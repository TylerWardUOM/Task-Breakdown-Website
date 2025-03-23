"use client";
import { useState } from "react";
import { Task, Subtask } from "@GlobalTypes/Task";
import { Filter } from "@FrontendTypes/filter";
import { useUserSettings } from "../../web/contexts/UserSettingsContext";
import { useTasks } from "./useTasks";
import { useSubtasks } from "./useSubtasks";
import { useCategories } from "./useCategories";

export const useTaskPage = () => {
  const { settings } = useUserSettings();
  const [sortBy, setSortBy] = useState<string>("priority");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAITaskModalOpen, setIsAITaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSubtasks, setSelectedSubtasks] = useState<Subtask[] | null>(null);
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
  const {tasks, setTasks, loadingTasks, isTogglingTask, isDeletingTask, toggleTaskCompletion, deleteTask} = useTasks();
  const {subtasks, setSubtasks, isTogglingSubtask, toggleSubtaskCompletion} = useSubtasks(tasks);
  const {categories} = useCategories();

  const handleFilterChange = (filters: Filter) => setSelectedFilter(filters);

  const openNewTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
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
  

  return {
    settings,
    tasks,
    subtasks,
    isTogglingSubtask,
    categories,
    loadingTasks,
    sortBy,
    isTaskModalOpen,
    isAITaskModalOpen,
    selectedTask,
    selectedSubtasks,
    isDeletingTask,
    isTogglingTask,
    showCompleted,
    selectedFilter,
    colourSchemeEnabled,
    handleFilterChange,
    handleSortChange,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
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
