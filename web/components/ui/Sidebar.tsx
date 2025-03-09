"use client";
import Link from "next/link";

// Define the Sidebar component
const Sidebar = ({ isOpen, closeSidebar }: { isOpen: boolean, closeSidebar: () => void }) => {
  return (
    <aside
      className={`w-64 bg-gray-900 text-white h-full p-4 fixed top-16 left-0 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } sm:block sm:translate-x-0`} // Show sidebar by default on larger screens
    >
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <nav className="space-y-2">
        <Link href="/dashboard" className="block hover:underline" onClick={closeSidebar}>
          Home
        </Link>
        <Link href="/tasks" className="block hover:underline" onClick={closeSidebar}>
          Tasks
        </Link>
        <Link href="/calendar" className="block hover:underline" onClick={closeSidebar}>
          Calendar
        </Link>
        <Link href="/analytics" className="block hover:underline" onClick={closeSidebar}>
          Analytics
        </Link>
        <Link href="/settings" className="block hover:underline" onClick={closeSidebar}>
          Settings
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
