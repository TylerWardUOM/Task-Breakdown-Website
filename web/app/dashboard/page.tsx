"use client";
import { useState, useEffect } from "react";
import { FiPlusCircle } from "react-icons/fi";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import TaskModal from "../../components/ui/TaskModal";
import Toast from "../../components/ui/Toast";
import { useAuth } from "../../lib/authContext"; // Import the useAuth hook
import { useRouter } from "next/navigation"; // Import useRouter for redirection

export default function Dashboard() {
  const { isAuthenticated, loading, userName } = useAuth(); // Get authentication status from context
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login page if user is not authenticated
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <p>Loading...</p>; // Display loading state while checking auth
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-2xl font-semibold">Good morning, {userName}!</h1>
      <p className="text-gray-500 italic mt-2">&quot;Inspirational Quote of the Day&quot;</p>

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
      </div>

      {/* Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} width="max-w-[20%]">
        <TaskModal onClose={() => setIsModalOpen(false)} onSave={() => {}} />
      </Modal>

      {/* Toast Notification */}
      {isToastVisible && <Toast message="This is a notification!" onClose={() => setIsToastVisible(false)} />}
    </div>
  );
}
