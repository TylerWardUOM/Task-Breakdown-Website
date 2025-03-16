"use client";

import { useState } from "react";
import { useUserSettings } from "../../../contexts/UserSettingsContext";
import useFetchTasks from "../../../hooks/useFetchTasks";
import { Task } from "../../../types/Task";
import { format, startOfWeek, addDays, addWeeks, subWeeks, parseISO } from "date-fns";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid"; // Import for generating unique IDs

const ITEM_TYPE = "TASK";
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM - 9 PM

interface CalendarTask extends Task {
  Calender_id: string; // Unique ID for each instance
  startTime: string;
  duration: number;
}

export default function WeeklyCalendar() {
  const { settings } = useUserSettings();
  const { tasks } = useFetchTasks();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [calendarTasks, setCalendarTasks] = useState<CalendarTask[]>([]);

  const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });

  const daysOfWeek = Array.from({ length: 7 }).map((_, i) =>
    format(addDays(startDate, i), "EEE, MMM d")
  );

  // Function to handle dropping tasks into the calendar
  const handleDropTask = (task: Task, dayIndex: number, hour: number) => {
    if (!task || !task.id || !task.title) {
      console.error("Invalid task dropped:", task);
      return; // Prevent breaking the app on invalid tasks
    }
  
    const taskStartTime = format(addDays(startDate, dayIndex), "yyyy-MM-dd") + ` ${hour}:00`;
  
    const newTask: CalendarTask = {
      Calender_id: uuidv4(), // Ensure each dropped task has a unique ID
      id: task.id, // Ensure the task has an ID
      title: task.title, // Ensure title is present
      description: task.description || "", // Avoid undefined values
      duration: task.duration ?? 30, // Default to 30 minutes if duration is missing
      startTime: taskStartTime, // Set start time
    };
  
    setCalendarTasks([...calendarTasks, newTask]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 bg-gray-100 text-black flex">
        {/* Sidebar (Task List) */}
        <div className="w-64 bg-white p-4 border-r overflow-y-auto h-full">
          <h3 className="text-lg font-semibold mb-3">Your Tasks</h3>
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => <DraggableTask key={task.id} task={task} />)
          ) : (
            <p className="text-gray-500 text-center">No tasks available</p>
          )}
        </div>

        {/* Main Calendar Content */}
        <div className="flex flex-col flex-1 p-6 overflow-hidden">
          {/* Header Navigation (Fixed to the top of the calendar) */}
          <div className="relative z-10 bg-gray-200 p-4 rounded-md flex justify-between items-center shadow-md mb-4">
            <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="px-4 py-2 bg-gray-300 rounded-md">
              &larr; Previous Week
            </button>
            <h2 className="text-xl font-semibold">
              {format(startDate, "MMM d, yyyy")} - {format(addDays(startDate, 6), "MMM d, yyyy")}
            </h2>
            <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="px-4 py-2 bg-gray-300 rounded-md">
              Next Week &rarr;
            </button>
          </div>

          {/* Scrollable Calendar */}
          <div className="overflow-auto border flex-1">
            <div className="grid grid-cols-8 w-full border">
              {/* Time Column */}
              <div className="border-r bg-gray-200">
                {HOURS.map((hour) => (
                  <div key={hour} className="h-16 flex items-center justify-center text-sm text-gray-600 border-b">
                    {hour}:00
                  </div>
                ))}
              </div>

              {/* Days of the Week */}
              {daysOfWeek.map((day, dayIndex) => (
                <CalendarDay
                  key={dayIndex}
                  day={day}
                  dayIndex={dayIndex}
                  onDropTask={(task, hour) => handleDropTask(task, dayIndex, hour)}
                  tasks={calendarTasks}
                />
              ))}
            </div>
          </div>

          {/* Exit Button */}
          <Link href={"/user/dashboard"}>
            <button className="mt-4 px-4 py-2 bg-gray-300 rounded-md">Exit Calendar</button>
          </Link>
        </div>
      </div>
    </DndProvider>
  );
}

/* Calendar Day Component */
const CalendarDay = ({
  day,
  dayIndex,
  onDropTask,
  tasks,
}: {
  day: string;
  dayIndex: number;
  onDropTask: (task: Task, hour: number) => void;
  tasks: CalendarTask[];
}) => {
  return (
    <div className="border-r bg-white">
      <div className="text-center font-semibold py-2 border-b bg-gray-100">{day}</div>
      {HOURS.map((hour) => (
        <TimeSlot key={hour} dayIndex={dayIndex} hour={hour} onDropTask={onDropTask} tasks={tasks} />
      ))}
    </div>
  );
};


const TimeSlot = ({
    dayIndex,
    hour,
    onDropTask,
    tasks,
  }: {
    dayIndex: number;
    hour: number;
    onDropTask: (task: Task, hour: number) => void;
    tasks: CalendarTask[];
  }) => {
    const [{ isOver }, drop] = useDrop({
      accept: ITEM_TYPE,
      drop: (item: Task) => onDropTask(item, hour),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });
  
    return (
      <div ref={drop} className={`relative h-16 border-b ${isOver ? "bg-blue-100" : ""}`}>
        {tasks
          .filter((task) => {
            if (!task.startTime) {
              console.warn("Task has no startTime:", task);
              return false;
            }
  
            let taskDate;
            try {
              // Ensure date is in ISO format before parsing
              const isoStartTime = task.startTime.replace(" ", "T");
              taskDate = new Date(isoStartTime);
  
              if (isNaN(taskDate.getTime())) {
                console.error("Invalid date parsed:", task.startTime);
                return false;
              }
            } catch (error) {
              console.error("Error parsing date:", error, task);
              return false;
            }
  
            return (
              format(taskDate, "yyyy-MM-dd") ===
                format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), dayIndex), "yyyy-MM-dd") &&
              Number(format(taskDate, "H")) === hour
            );
          })
          .map((task) => (
            <div
              key={task.Calender_id}
              className="absolute left-0 right-0 bg-blue-500 text-white px-3 py-1 rounded"
              style={{ top: 0, height: `${(task.duration / 60) * 4}rem` }} // Task spans multiple slots
            >
              {task.title}
            </div>
          ))}
      </div>
    );
  };
  
  

/* Draggable Task Component */
const DraggableTask = ({ task }: { task: Task }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: task,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`cursor-move p-2 rounded bg-blue-500 text-white flex justify-between items-center ${isDragging ? "opacity-50" : ""}`}
    >
      {task.title} ({task.duration ?? 30} min) {/* Default duration shown */}
    </div>
  );
};
