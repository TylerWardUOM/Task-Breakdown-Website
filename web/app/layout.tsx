"use client";
import "./globals.css";
import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";
import { AuthProvider } from "../lib/authContext"; // Import your AuthProvider
import { useState } from "react"; // Import useState for managing sidebar state

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle sidebar visibility
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AuthProvider>
      <html lang="en">
        <body className="h-screen w-screen flex flex-col">
          {/* Navbar: Full width, stays at the top */}
          <nav className="fixed top-0 left-0 w-full h-16 bg-gray-800 text-white flex items-center px-4 z-50 shadow-md">
            <Navbar onToggleSidebar={toggleSidebar} />
          </nav>

          {/* Layout Container */}
          <div className="relative flex flex-1 pt-16">
            {/* Sidebar: Fixed to the left, full height */}
            <aside
              className={`w-64 bg-gray-900 text-white h-screen fixed left-0 top-16 shadow-md transition-transform duration-300 z-40 ${
                isSidebarOpen ? "transform-none" : "-translate-x-full"
              } sm:block`} // Hides sidebar on mobile
            >
              <Sidebar isOpen={isSidebarOpen} />
            </aside>

            {/* Main Content: Takes up remaining space, not affected by sidebar */}
            <main className="flex-1 p-6 bg-gray-100 overflow-auto ml-0 sm:ml-0">
              {children}
            </main>
          </div>
        </body>
      </html>
    </AuthProvider>
  );
}
