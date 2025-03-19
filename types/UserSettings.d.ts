import { ColourScheme } from "./ColourScheme";

export interface UserSettings {
    theme: "light" | "dark";        // Matches API format
    notifications_enabled: boolean; // Matches API format (was notificationsEnabled)
    colour_scheme: ColourScheme;    // Matches API format (was colourScheme)
  }