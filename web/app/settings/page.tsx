"use client";
import { useUserSettings } from "../../contexts/UserSettingsContext";
import { useState, useEffect, useRef } from "react";
import ColorSwatchesPicker from "../../components/ui/ColorSwatchesPicker";
import { ColourScheme, UserSettings } from "../../types/userSettings";

const DEFAULT_COLOUR_SCHEME: ColourScheme = {
    overdue: "bg-red-600",
    highPriority: "bg-red-200",
    mediumPriority: "bg-yellow-200",
    lowPriority: "bg-green-200",
  };
  

const SettingsPage = () => {
  const { settings, updateSettings } = useUserSettings();
  const [colorPickerVisible, setColorPickerVisible] = useState<string | null>(null);
  const colorPickerRef = useRef<HTMLDivElement | null>(null);

  const handleColorChange = (key: keyof UserSettings["colour_scheme"], colorClass: string) => {
    const updatedSettings = {
      colour_scheme: { ...settings.colour_scheme, [key]: colorClass },
    };
  
    console.log("Updating settings with:", updatedSettings); // Log the update
  
    updateSettings(updatedSettings);
    setColorPickerVisible(null); // Close the picker after selection
  };
  
  const resetColors = () => {
    updateSettings({ colour_scheme: DEFAULT_COLOUR_SCHEME });
  };


  const handleRowClick = (key: string) => {
    setColorPickerVisible(colorPickerVisible === key ? null : key);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setColorPickerVisible(null);
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setColorPickerVisible(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  if (!settings) return <p>Loading...</p>;

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-4">User Settings</h1>
  
      {/* Theme Selector */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Theme</h2>
        <select
          value={settings.theme}
          onChange={(e) => updateSettings({ theme: e.target.value as UserSettings["theme"] })}
          className="border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
          aria-label="Theme Selector"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
  
      {/* Notifications Toggle */}
      <div className="mt-4 flex items-center space-x-2">
        <label className="text-lg">Enable Notifications</label>
        <input
          type="checkbox"
          checked={settings.notifications_enabled}
          onChange={() => updateSettings({ notifications_enabled: !settings.notifications_enabled })}
          className="w-6 h-6 border border-gray-300 rounded bg-white text-black dark:bg-gray-800 dark:border-gray-600 dark:checked:bg-gray-600"
          aria-label="Toggle Notifications"
        />
      </div>
  
      {/* Priority Colors Table */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Priority Colors</h2>
        <div className="overflow-x-auto w-80 mx-auto">
          <table className="w-full table-auto border-collapse text-sm rounded-md overflow-hidden">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-2 py-1 border dark:border-gray-600 rounded-t-md">Priority Type</th>
              </tr>
            </thead>
            <tbody>
              {["overdue", "highPriority", "mediumPriority", "lowPriority"].map((key, index, arr) => {
                const currentColor = settings.colour_scheme[key as keyof ColourScheme];
                return (
                  <tr
                    key={key}
                    className={`group cursor-pointer border ${currentColor} dark:border-gray-600`}
                    onClick={() => handleRowClick(key)}
                  >
                    <td className={`px-2 py-1 border text-center dark:border-gray-600 ${index === arr.length - 1 ? "rounded-b-md" : ""}`}>
                      {key}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
  
        {/* Reset Colors Button */}
        <div className="mt-3 flex justify-center">
          <button
            onClick={resetColors}
            className="bg-gray-200 text-black dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-1 px-3 rounded-md shadow"
          >
            Reset Colors
          </button>
        </div>
      </div>
  
      {/* Floating Color Picker */}
      {colorPickerVisible && (
        <div
          ref={colorPickerRef}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 dark:text-white shadow-lg rounded p-4"
        >
          <ColorSwatchesPicker
            currentColor={settings.colour_scheme[colorPickerVisible as keyof UserSettings["colour_scheme"]]}
            onColorChange={(color) =>
              handleColorChange(colorPickerVisible as keyof UserSettings["colour_scheme"], color)
            }
          />
        </div>
      )}
    </div>
  );
};
export default SettingsPage;
