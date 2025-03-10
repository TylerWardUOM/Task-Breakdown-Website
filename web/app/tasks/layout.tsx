// app/user/dashboard/layout.tsx
import { ReactNode } from "react";
import { UserSettingsProvider } from "../../contexts/UserSettingsContext";
export default function UserSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <UserSettingsProvider>
      {/* Custom layout components specific to user settings */}
      <div className="settings-layout">
        {children}
      </div>
    </UserSettingsProvider>
  );
}