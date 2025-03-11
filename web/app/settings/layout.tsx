"use client";
import { ReactNode, useEffect, useState } from "react";
import { UserSettingsProvider, useUserSettings } from "../../contexts/UserSettingsContext";
import { useAuth } from "../../contexts/authContext";

const SettingsLayoutContent = ({ children }: { children: ReactNode }) => {
  const { settings } = useUserSettings();
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const { isAuthenticated, redirectToLogin } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      redirectToLogin(); // Redirect if not authenticated
      return;
    }

    if (settings?.theme) {
      document.documentElement.classList.toggle("dark", settings.theme === "dark");
      setIsThemeLoaded(true);
    }
  }, [isAuthenticated, settings?.theme, redirectToLogin]);

  if (!isAuthenticated || !isThemeLoaded) return null; // Prevent render if not authenticated or theme not loaded

  return (
    <div className="settings-layout flex-1 w-full h-full p-6 bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
      {children}
    </div>
  );
};

export default function UserSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <UserSettingsProvider>
      <SettingsLayoutContent>{children}</SettingsLayoutContent>
    </UserSettingsProvider>
  );
}
