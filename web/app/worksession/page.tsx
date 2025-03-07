"use client";
import { useState } from "react";
import TaskTable from "../../components/TaskTable";
import { PlusCircleIcon, XCircleIcon, ChevronUpIcon, ChevronDownIcon, CheckCircleIcon } from "@heroicons/react/solid";

interface Task {
  id: number;
  title: string;
  priority: number;
  dueDate: string;
  duration: number;
  category: string;
  isCompleted: boolean;
}

const WorkSessionPage = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Task 1", priority: 3, dueDate: "2025-04-25", duration: 0.3, category: "Other", isCompleted: false },
    { id: 2, title: "Task 2", priority: 2, dueDate: "2025-04-27", duration: 0.5, category: "Work", isCompleted: false },
    { id: 3, title: "Task 3", priority: 1, dueDate: "2025-05-01", duration: 1, category: "Personal", isCompleted: false },
  ]);

  const [workSessionTasks, setWorkSessionTasks] = useState<Task[]>([]);
  const [showTaskList, setShowTaskList] = useState(false);

  const addToWorkSession = (task: Task) => {
    if (!workSessionTasks.some((t) => t.id === task.id)) {
      setWorkSessionTasks([...workSessionTasks, task]);
    }
  };

  const removeFromWorkSession = (taskId: number) => {
    setWorkSessionTasks(workSessionTasks.filter((task) => task.id !== taskId));
  };

  const markTaskAsComplete = (taskId: number) => {
    setWorkSessionTasks(
      workSessionTasks.map((task) =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const moveTaskUp = (index: number) => {
    if (index > 0) {
      const updatedTasks = [...workSessionTasks];
      [updatedTasks[index - 1], updatedTasks[index]] = [updatedTasks[index], updatedTasks[index - 1]];
      setWorkSessionTasks(updatedTasks);
    }
  };

  const moveTaskDown = (index: number) => {
    if (index < workSessionTasks.length - 1) {
      const updatedTasks = [...workSessionTasks];
      [updatedTasks[index], updatedTasks[index + 1]] = [updatedTasks[index + 1], updatedTasks[index]];
      setWorkSessionTasks(updatedTasks);
    }
  };

  return (
    <div className="container mx-auto p-6 flex flex-col space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold">Work Session</h3>

        {/* Show Task List Button */}
        <button
          onClick={() => setShowTaskList(!showTaskList)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {showTaskList ? "Hide Task List" : "Show Task List"}
        </button>
      </div>

      {/* Task List Table (Above Work Session Table) */}
      {showTaskList && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Task List</h3>
          <TaskTable
            tasks={tasks}
            renderActions={(task) => (
              <button
                onClick={() => addToWorkSession(task)}
                className={`px-4 py-2 rounded ${workSessionTasks.some((t) => t.id === task.id) ? "bg-gray-500" : "bg-green-500"} text-white`}
              >
                {workSessionTasks.some((t) => t.id === task.id) ? "Already in Session" : "Add to Session"}
              </button>
            )}
          />
        </div>
      )}

      {/* Work Session Section */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Current Work Session</h3>
        {workSessionTasks.length > 0 ? (
          <TaskTable
            tasks={workSessionTasks}
            renderActions={(task) => (
              <div className="flex space-x-2">
                <button onClick={() => moveTaskUp(workSessionTasks.indexOf(task))} className="bg-gray-500 text-white px-2 py-1 rounded">
                  <ChevronUpIcon className="h-5 w-5" />
                </button>
                <button onClick={() => moveTaskDown(workSessionTasks.indexOf(task))} className="bg-gray-500 text-white px-2 py-1 rounded">
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
                <button onClick={() => markTaskAsComplete(task.id)} className={`px-4 py-2 rounded ${task.isCompleted ? "bg-yellow-500" : "bg-green-500"}`}>
                  <CheckCircleIcon className="h-5 w-5" />
                </button>
                <button onClick={() => removeFromWorkSession(task.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          />
        ) : (
          <p className="mt-4 text-gray-500">No tasks in the current session.</p>
        )}
      </div>
    </div>
  );
};

export default WorkSessionPage;
