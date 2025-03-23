"use client";
import { UserSettings } from "@GlobalTypes/UserSettings";
import { usePathname } from "next/navigation";
import { createContext, useState, useEffect, useContext } from "react";
import { useApiWrapper } from "@Hooks/useApiWrapper";

interface UserSettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const getDefaultUserSettings = (): UserSettings => ({
    theme: "dark",
    notifications_enabled: true,
    colour_scheme: {
      overdue: "bg-red-600",
      lowPriority: "bg-green-200",
      mediumPriority: "bg-yellow-200",
      highPriority: "bg-red-200",
    },
  });

  const [settings, setSettings] = useState<UserSettings | null>(null); // Initially null
  const pathname = usePathname();
  const {fetchUserSettings,saveUserSettings} = useApiWrapper();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const userSettings = await fetchUserSettings();
        if (userSettings) {
          setSettings(userSettings);
          localStorage.setItem("userSettings", JSON.stringify(userSettings));
        } else {
          throw new Error("Fetched settings are null or invalid.");
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
        
        if (!settings) {
          console.warn("Using Default Settings");
          const defaultSettings = getDefaultUserSettings();
          setSettings(defaultSettings);
          localStorage.setItem("userSettings", JSON.stringify(defaultSettings));
        }
      }
    };

    // Check localStorage for cached settings first
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    fetchSettings(); // Always try fetching latest settings
  }, [pathname]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!settings) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem("userSettings", JSON.stringify(updatedSettings));

    try {
      await saveUserSettings(updatedSettings);
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
