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
  // Set initial settings to the default settings.

  const getDefaultUserSettings = (): UserSettings => {
    return {
      theme: 'light',
      language: 'en',
      notificationsEnabled: true,
      colourScheme: {
        overdue: 'bg-red-600',
        lowPriority: 'bg-green-200',
        mediumPriority: 'bg-yellow-200',
        highPriority: 'bg-red-200',
      },
      darkMode: false,
    };
  };

  const [settings, setSettings] = useState<UserSettings>(getDefaultUserSettings());
  const { firebaseToken } = useAuth();
  const pathname = usePathname();


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!firebaseToken) return;

        const userSettings = await fetchUserSettings(firebaseToken);
        
        // If fetched settings are invalid or null, keep the default settings
        if (userSettings) {
          setSettings(userSettings);
          localStorage.setItem("userSettings", JSON.stringify(userSettings));
        } else {
          console.warn("Fetched settings are null or invalid. Using Default Settings");
          setSettings(getDefaultUserSettings());
          localStorage.setItem("userSettings", JSON.stringify(getDefaultUserSettings()));
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
        console.warn("Using Default Settings");
        setSettings(getDefaultUserSettings());
        localStorage.setItem("userSettings", JSON.stringify(getDefaultUserSettings()));
      }
    };

    // Check if settings are already in localStorage before fetching
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      fetchSettings();  // Fetch settings if none found in localStorage
    }
  }, [firebaseToken, pathname]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem("userSettings", JSON.stringify(updatedSettings));

    try {
      const firebaseToken = localStorage.getItem("firebaseToken");
      if (firebaseToken) {
        await saveUserSettings(firebaseToken, updatedSettings);
      }
    } catch (error) {
      console.error("Failed to save settings to API", error);
    }
  };

  return (
    <UserSettingsContext.Provider value={{ settings, updateSettings }}>
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
