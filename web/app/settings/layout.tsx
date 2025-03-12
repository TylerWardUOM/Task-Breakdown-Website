"use client";
import { ReactNode, useEffect, useState } from "react";
import { UserSettingsProvider, useUserSettings } from "../../contexts/UserSettingsContext";
import { AuthProvider, useAuth } from "../../contexts/authContext";
import Navbar from "../../components/ui/Navbar";
import Sidebar from "../../components/ui/Sidebar";

const LoadingScreen = () => {
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
    }
  }, []);

  if (theme === null) return null; // Prevent rendering until theme is set

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-gray-900 text-black dark:text-white">
      <p className="text-xl font-semibold">Loading...</p>
    </div>
  );
};

const SettingsLayoutContent = ({ children }: { children: ReactNode }) => {
  const { settings } = useUserSettings();
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {userName} = useAuth();

  useEffect(() => {
    if (settings?.theme) {
      document.documentElement.classList.toggle("dark", settings.theme === "dark");
      setIsThemeLoaded(true);
    }
  }, [settings?.theme]);

  if (!isThemeLoaded) return <LoadingScreen />; // Show loading page until theme is applied

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Navbar (fixed at the top) */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-gray-800 text-white flex items-center px-4 z-50 shadow-md">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} username={userName} />
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
    <div className="settings-layout flex-1 w-full h-full p-6 bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
      {children}
    </div>
    </div>
    </div>
  );
};

function ProtectedSettingsLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, redirectToLogin } = useAuth();

  if (loading) return <LoadingScreen />; // Show loading screen while auth is loading

  if (!isAuthenticated) {
    redirectToLogin();
    return null; // Prevent rendering anything until redirected
  }

  return (
    <UserSettingsProvider>
      <SettingsLayoutContent>{children}</SettingsLayoutContent>
    </UserSettingsProvider>
  );
}

// Ensure `AuthProvider` is always wrapping `useAuth()`
export default function UserSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedSettingsLayout>{children}</ProtectedSettingsLayout>
    </AuthProvider>
  );
}
