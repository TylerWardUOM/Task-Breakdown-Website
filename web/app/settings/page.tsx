"use client";
import { useUserSettings } from "../../contexts/UserSettingsContext";
import { useState, useEffect, useRef } from "react";
import ColorSwatchesPicker from "../../components/ui/ColorSwatchesPicker";
import { UserSettings } from "../../types/userSettings";

const SettingsPage = () => {
  const { settings, updateSettings } = useUserSettings();
  const [colorPickerVisible, setColorPickerVisible] = useState<string | null>(null); // Tracks the active color picker
  const colorPickerRef = useRef<HTMLTableDataCellElement | null>(null);

  const handleColorChange = (key: keyof UserSettings["colourScheme"], color: string) => {
    updateSettings({
      colourScheme: { ...settings.colourScheme, [key]: color },
    });
  };

  const handleRowClick = (key: string) => {
    setColorPickerVisible(colorPickerVisible === key ? null : key); // Toggle visibility of the color picker
  };

  useEffect(() => {
    // Add event listener to detect outside clicks
    const handleOutsideClick = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setColorPickerVisible(null); // Close the picker if the click is outside
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setColorPickerVisible(null); // Close the picker if Escape is pressed
      }
    };

    document.addEventListener("mousedown", handleOutsideClick); // Listen for outside clicks
    document.addEventListener("keydown", handleEscKey); // Listen for Escape key press

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  if (!settings) return <p>Loading...</p>;

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-4">User Settings</h1>

      {/* Dark Mode Toggle */}
      <div className="flex items-center space-x-2">
        <label className="text-lg">Dark Mode</label>
        <input
          type="checkbox"
          checked={settings.darkMode}
          onChange={() => updateSettings({ darkMode: !settings.darkMode })}
          className="w-6 h-6"
          aria-label="Toggle Dark Mode"
        />
      </div>

      {/* Theme Selector */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Theme</h2>
        <select
          value={settings.theme}
          onChange={(e) => updateSettings({ theme: e.target.value as UserSettings["theme"] })}
          className="border p-2 rounded"
          aria-label="Theme Selector"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Language Selector */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Language</h2>
        <select
          value={settings.language}
          onChange={(e) => updateSettings({ language: e.target.value as UserSettings["language"] })}
          className="border p-2 rounded"
          aria-label="Language Selector"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>

      {/* Notifications Toggle */}
      <div className="mt-4 flex items-center space-x-2">
        <label className="text-lg">Enable Notifications</label>
        <input
          type="checkbox"
          checked={settings.notificationsEnabled}
          onChange={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
          className="w-6 h-6"
          aria-label="Toggle Notifications"
        />
      </div>

      {/* Priority Colors */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Priority Colors</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2">Priority Type</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(settings.colourScheme).map((key, index) => {
                const currentColor = settings.colourScheme[key as keyof UserSettings["colourScheme"]];
                return (
                  <tr
                    key={`${key}-${index}`}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleRowClick(key)}
                    style={{
                      backgroundColor: currentColor,
                    }}
                  >
                    <td className="px-4 py-2">{key}</td>
                    {colorPickerVisible === key && (
                      <td ref={colorPickerRef} className="px-4 py-2 absolute z-10 top-0 left-1/2 transform -translate-x-1/2">
                        <ColorSwatchesPicker
                          currentColor={currentColor}
                          onColorChange={(color) => handleColorChange(key as keyof UserSettings["colourScheme"], color)}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
