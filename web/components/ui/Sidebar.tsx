"use client";
import Link from "next/link";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-900 text-white h-full p-4">
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <nav className="space-y-2">
        <Link href="/dashboard" className="block hover:underline">Home</Link>
        <Link href="/tasks" className="block hover:underline">Tasks</Link>
        <Link href="/calendar" className="block hover:underline">Calendar</Link>
        <Link href="/analytics" className="block hover:underline">Analytics</Link>
        <Link href="/settings" className="block hover:underline">Settings</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;