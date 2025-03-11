"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { UserSettings } from "../types/userSettings";
import { fetchUserSettings, saveUserSettings } from "../lib/api";
import { useAuth } from "./authContext";
import { usePathname } from "next/navigation";

interface UserSettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const getDefaultUserSettings = (): UserSettings => ({
    theme: "light",
    notifications_enabled: true,
    colour_scheme: {
      overdue: "bg-red-600",
      lowPriority: "bg-green-200",
      mediumPriority: "bg-yellow-200",
      highPriority: "bg-red-200",
    },
  });

  const [settings, setSettings] = useState<UserSettings | null>(null); // Initially null
  const { firebaseToken } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!firebaseToken) return;

        const userSettings = await fetchUserSettings(firebaseToken);
        
        if (userSettings) {
          setSettings(userSettings);
          localStorage.setItem("userSettings", JSON.stringify(userSettings));
        } else {
          throw new Error("Fetched settings are null or invalid.");
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
        
        // Only apply defaults if settings were never set
        if (!settings) {
          console.warn("Using Default Settings");
          const defaultSettings = getDefaultUserSettings();
          setSettings(defaultSettings);
          localStorage.setItem("userSettings", JSON.stringify(defaultSettings));
        }
      }
    };

    const savedSettings = localStorage.getItem("userSettings");

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings)); // Use cached settings
    }

    fetchSettings(); // Always fetch to get latest settings
  }, [firebaseToken, pathname]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!settings) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem("userSettings", JSON.stringify(updatedSettings));

    try {
      if (firebaseToken) {
        await saveUserSettings(firebaseToken, updatedSettings);
      }
    } catch (error) {
      console.error("Failed to save settings to API", error);
    }
  };

  return (
    <UserSettingsContext.Provider value={{ settings: settings ?? getDefaultUserSettings(), updateSettings }}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error("useUserSettings must be used within a UserSettingsProvider");
  }
  return context;
};
