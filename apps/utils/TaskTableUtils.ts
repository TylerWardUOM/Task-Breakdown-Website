import { Category } from "@GlobalTypes/Category";
import { ColourScheme } from "@GlobalTypes/ColourScheme";
import { Filter } from "@FrontendTypes/filter";
import {Subtask, Task} from "@GlobalTypes/Task"
import { calculatePriority } from "@lib/calculatePriority";

// Formats the duration (in minutes) into a human-readable string.
export const renderDuration = (duration: Task["duration"]) => {
    if (duration === null) return "N/A";
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  
  // Formats the due date for display.
 export const renderDueDate = (due_date: string | null) => {
    if (!due_date) return "N/A";
    return new Date(due_date).toLocaleDateString();
  };
  
  // Determines the background colour for a row based on priority and colour scheme.
 export const getPrioritycolour = (priority: number, colourScheme: ColourScheme, colourSchemeEnabled: boolean): string => {
    if (!colourSchemeEnabled) return "dark:bg-gray-800 dark:text-white"; // If gradient is not enabled, return no colour
  
    // Overdue tasks should have a distinct colour (red)
    if (priority === 11) return colourScheme.overdue; // Red for overdue tasks
  
    // Gradient logic for priority levels
    if (priority <= 3) {
      return colourScheme.lowPriority; // Low priority (Green)
    } else if (priority <= 7) {
      return colourScheme.mediumPriority; // Medium priority (Yellow)
    } else {
      return colourScheme.highPriority; // High priority (Red)
    }
  };
  
  // Modify sorting logic based on the selected sortBy prop
export const getSortedTasks = (tasks: (Task & { priority: number })[], sortBy: string) => {
    return [...tasks].sort((a, b) => {
      if (sortBy === "priority") {
        return b.priority - a.priority;
      }
  
      if (sortBy === "dueDate") {
        const dueDateA = a.due_date ? new Date(a.due_date) : new Date(8640000000000000);
        const dueDateB = b.due_date ? new Date(b.due_date) : new Date(8640000000000000);
  
        // Overdue tasks should appear first
        if (a.priority === 11 && b.priority !== 11) return -1;
        if (b.priority === 11 && a.priority !== 11) return 1;
  
        return dueDateA.getTime() - dueDateB.getTime();
      }
  
      return 0;
    });
  };
  
export const getOrdinalSuffix = (num: number): string => {
    if (num % 100 >= 11 && num % 100 <= 13) {
      return `${num}th`; // Special case for 11th, 12th, 13th
    }
    switch (num % 10) {
      case 1: return `${num}st`;
      case 2: return `${num}nd`;
      case 3: return `${num}rd`;
      default: return `${num}th`;
    }
  };
  
export const getSortedSubtasks = (subtasks: Subtask[]) => {
    return [...subtasks].sort((a, b) => {
      // If both have valid orders, sort by order (ascending)
      if (a.order !== null && b.order !== null) {
        return a.order - b.order;
      }
      
      // If only one has a valid order, prioritize it
      if (a.order === null && b.order !== null) return 1;
      if (b.order === null && a.order !== null) return -1;
  
      // If both have null orders, sort by importance_factor (descending)
      return (b?.importance_factor ?? 5) - (a?.importance_factor ?? 5);
    });
  };
  
  
  // Modify filtering logic to consider completed tasks visibility
  // Filters tasks based on selected filters.
export const getFilteredTasks = (
    tasks: (Task & { priority: number })[],
    selectedFilter: Filter,
    showCompletedTasks: boolean
  ) => {
    let filteredTasks = showCompletedTasks ? tasks : tasks.filter((task) => !task.completed);
  
    const { filter, minPriority, maxPriority, selectedCategories } = selectedFilter;
  
    if (filter === "priorityRange") {
      filteredTasks = filteredTasks.filter((task) => task.priority >= minPriority && task.priority <= maxPriority);
    }
  
    if (filter === "thisWeek") {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
  
      filteredTasks = filteredTasks.filter((task) => {
        if (!task.due_date) return false;
        const taskDueDate = new Date(task.due_date);
        return taskDueDate >= weekStart && taskDueDate <= weekEnd;
      });
    }
  
    if (filter === "Priority>7") {
      filteredTasks = filteredTasks.filter((task) => task.priority > 7);
    }
  
    if (filter === "overDue") {
      const now = new Date();
      filteredTasks = filteredTasks.filter((task) => task.due_date && new Date(task.due_date) < now && !task.completed);
    }
  
    if (filter === "highPriority") {
      filteredTasks = [...filteredTasks].sort((a, b) => b.priority - a.priority).slice(0, 5);
    }
  
    if (selectedCategories.length > 0) {
      filteredTasks = filteredTasks.filter((task) => selectedCategories.includes(task.category_id ?? -1));
    }
  
    return filteredTasks;
  };
  
  
  // Function to get category name from category ID
export const getCategoryName = (categoryId: number | null, categories: Category[]) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };
  
  // Helper function to normalize priorities
 export const normalizePriorities = (tasks: Task[]): (Task & { priority: number })[] => {
    const tasksWithPriorities = tasks.map(task => ({
      ...task,
      priority: calculatePriority(task),
    }));
  
    const maxPriority = Math.max(...tasksWithPriorities.filter(t => t.priority !== 11).map(t => t.priority), 1);
  
    return tasksWithPriorities.map(task => ({
      ...task,
      priority: task.priority === 11 ? 11 : parseFloat(((task.priority / maxPriority) * 10).toFixed(2)),
    }));
  };
  