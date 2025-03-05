"use client";
import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import Button from "../../components/ui/Button2";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import TaskModal from "../../components/ui/TaskModal"; 
import Toast from "../../components/ui/Toast";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Urgent Task", priority: "High" },
    { id: 2, title: "Meeting at 3 PM", priority: "Upcoming" },
  ]);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-2xl font-semibold">Good morning, User! 🌞</h1>
      <p className="text-gray-500 italic mt-2">"Inspirational Quote of the Day"</p>

      {/* Focus Mode & Add Task Buttons */}
      <div className="mt-6 flex space-x-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">🎯 Start Focus Mode</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 flex items-center" onClick={() => setIsModalOpen(true)}>
          <FiPlusCircle className="mr-2" /> Add New Task
        </button>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card title="Tasks Completed">
          <p>10 this week</p>
        </Card>
        <Card title="Upcoming Events">
          <p>Meeting at 3PM</p>
        </Card>
        <Card title="Focus Mode Stats">
          <p>5 hours focused today</p>
        </Card>
      </div>

      {/* Tasks Overview */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">🔥 High Priority Tasks</h2>
        <ul className="mt-3 space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="bg-white p-3 rounded-lg shadow flex justify-between">
              <span>{task.title}</span>
              <span className="text-red-500 font-semibold">{task.priority}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TaskModal onClose={() => setIsModalOpen(false)} onSave={() => {}} />
      </Modal>


      {/* Toast Notification */}
      {isToastVisible && <Toast message="This is a notification!" onClose={() => setIsToastVisible(false)} />}
    </div>
  );
}
