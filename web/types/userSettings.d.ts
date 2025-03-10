export interface UserSettings {
    theme: 'light' | 'dark';         // Example: user theme preference (either 'light' or 'dark')
    language: 'en' | 'es' | 'fr';    // Example: user language preference (English, Spanish, or French)
    notificationsEnabled: boolean;   // Example: whether notifications are enabled

      // Customizable color scheme for task priorities
  colorScheme: {
    overdue: string;               // Color for overdue tasks (e.g., 'bg-red-600')
    lowPriority: string;           // Color for low priority tasks (e.g., 'bg-green-200')
    mediumPriority: string;        // Color for medium priority tasks (e.g., 'bg-yellow-200')
    highPriority: string;          // Color for high priority tasks (e.g., 'bg-red-200')
  };
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
