"use client";
import { useState, useEffect } from "react";
import { FiPlusCircle } from "react-icons/fi";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import TaskModal from "../../components/ui/TaskModal";
import TaskCompletedTimeframe from "../../components/TaskCompletedTimeframe";
import Toast from "../../components/ui/Toast";
import { useAuth } from "../../lib/authContext"; // Import the useAuth hook
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import TaskTable from "../../components/TaskTable";
import useFetchTasks from "../../hooks/useFetchTasks";
import Link from 'next/link';



export default function Dashboard() {
  const { isAuthenticated, loading, userName, firebaseToken } = useAuth(); // Get authentication status from context
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [colorSchemeEnabled] = useState(true);
  const [TablecolorScheme] = useState({
    overdue: "bg-red-600",        // Overdue tasks color
    lowPriority: "bg-green-200",  // Low priority color
    mediumPriority: "bg-yellow-200", // Medium priority color
    highPriority: "bg-red-200",   // High priority color
  });
  const router = useRouter();

  const { tasks, loadingTasks, setTasks } = useFetchTasks(firebaseToken);


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
        <TaskCompletedTimeframe timeframe="week" title="Tasks Completed This Week" firebaseToken={firebaseToken} />
        <Card title="Upcoming Events">
          <p className="text-center"> Meeting at 3PM</p>
        </Card>
        <Card title="Focus Mode Stats">
          <p className="text-center">5 hours focused today</p>
        </Card>
      </div>

      {/* Tasks Overview */}
      <div className="mt-6 w-full flex justify-center">
        <div className="max-w-[80%] min-w-[80%]">
          <h2 className="text-xl font-semibold mb-4">🔥 High Priority Tasks</h2>
          <TaskTable
            tasks={tasks}
            filter={"highPriority"}
            sortBy={"Priority"}
            colorScheme={TablecolorScheme}
            colorSchemeEnabled={colorSchemeEnabled}
          />
          <div className="flex justify-center mt-4">
            <Link href="/tasks">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700">
                All Tasks
              </button>
            </Link>
          </div>
        </div>
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
