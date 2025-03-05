"use client";

import Button from "../../components/ui/Button2";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import { useState } from "react";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  return (
    <div className="flex flex-col flex-grow w-full h-full p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
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

      {/* Buttons */}
      <div className="mt-8 flex space-x-4">
        <Button label="Add Task" onClick={() => setIsModalOpen(true)} />
        <Button label="Show Notification" onClick={() => setIsToastVisible(true)} />
      </div>

      {/* Modal for adding a task */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-lg font-bold">Add a New Task</h2>
        <p>Task creation form goes here...</p>
      </Modal>

      {/* Toast Notification */}
      {isToastVisible && <Toast message="This is a notification!" onClose={() => setIsToastVisible(false)} />}
    </div>
  );
}
