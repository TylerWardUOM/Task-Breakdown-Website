"use client";
import { ReactNode, useEffect } from "react";
import { UserSettingsProvider, useUserSettings } from "../../contexts/UserSettingsContext";

const SettingsLayoutContent = ({ children }: { children: ReactNode }) => {
  const { settings } = useUserSettings();

  useEffect(() => {
    if (settings?.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings?.theme]);

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
