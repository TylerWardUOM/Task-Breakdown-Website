"use client";
import { ReactNode, useEffect, useState } from "react";
import { UserSettingsProvider, useUserSettings } from "../../contexts/UserSettingsContext";

const SettingsLayoutContent = ({ children }: { children: ReactNode }) => {
  const { settings } = useUserSettings();
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    if (settings?.theme) {
      document.documentElement.classList.toggle("dark", settings.theme === "dark");
      setIsThemeLoaded(true);
    }
  }, [settings?.theme]);

  if (!isThemeLoaded) return null; // Prevent render until theme is applied

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
