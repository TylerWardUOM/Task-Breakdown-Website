export interface ColourScheme {
  overdue: string;               // Color for overdue tasks (e.g., 'bg-red-600')
  highPriority: string;          // Color for high priority tasks (e.g., 'bg-red-200')
  mediumPriority: string;        // Color for medium priority tasks (e.g., 'bg-yellow-200')
  lowPriority: string;           // Color for low priority tasks (e.g., 'bg-green-200')
}

export interface UserSettings {
  theme: "light" | "dark";        // Matches API format
  notifications_enabled: boolean; // Matches API format (was notificationsEnabled)
  colour_scheme: ColourScheme;    // Matches API format (was colourScheme)
}


//   CREATE TABLE user_settings (
//     user_id INT PRIMARY KEY,
//     theme VARCHAR(10),
//     language VARCHAR(10),
//     notifications_enabled BOOLEAN,
//     color_scheme JSON,
//     -- Add any other user settings columns
//     FOREIGN KEY (user_id) REFERENCES users(id) -- Assuming there's a 'users' table
// );
