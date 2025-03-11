"use client";
import "./globals.css";
import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";
import { AuthProvider, useAuth } from "../contexts/authContext";
import { useEffect, useState } from "react";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth(); // Get auth state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);

  // Detect and apply system theme before rendering anything
  useEffect(() => {
    if (typeof window !== "undefined") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
    }
  }, []);

  // Don't render anything until the system theme is set
  if (theme === null) return null;

  // Show loading state until authentication completes
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center dark:bg-gray-900 dark:text-white bg-white text-black">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Navbar (fixed at the top) */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-gray-800 text-white flex items-center px-4 z-50 shadow-md">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </nav>

      {/* Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Layout container */}
      <div className="flex flex-1 min-h-0 pt-16 relative">
        {/* Sidebar */}
        <aside
          className={`absolute top-0 left-0 w-64 bg-gray-900 text-white h-full shadow-md transition-transform duration-300 z-40 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-full overflow-auto bg-gray-100 dark:bg-gray-900 dark:text-white">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body>
          <LayoutContent>{children}</LayoutContent>
        </body>
      </html>
    </AuthProvider>
  );
}
