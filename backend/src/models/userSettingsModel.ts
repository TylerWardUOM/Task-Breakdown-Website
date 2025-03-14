import pool from '../config/db';  // Database connection
import { QueryResult } from 'pg';  // PostgreSQL query result type

// Default settings (same as frontend defaults)
const defaultSettings = {
  theme: 'dark',
  notifications_enabled: true,
  colour_scheme: {
    overdue: 'bg-red-600',
    lowPriority: 'bg-green-200',
    mediumPriority: 'bg-yellow-200',
    highPriority: 'bg-red-200',
  },
};

// ✅ Create user settings with default values
export const createUserSettings = async (user_id: string): Promise<QueryResult> => {
  return await pool.query(
    `INSERT INTO user_settings (user_id, theme, notifications_enabled, colour_scheme) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [user_id, defaultSettings.theme, defaultSettings.notifications_enabled, JSON.stringify(defaultSettings.colour_scheme)]
  );
};

// ✅ Fetch user settings by user ID
export const getUserSettings = async (user_id: string): Promise<QueryResult> => {
  return await pool.query(`SELECT * FROM user_settings WHERE user_id = $1`, [user_id]);
};

// ✅ Update user settings (allows partial updates)
export const updateUserSettings = async (user_id: string, updates: Partial<{ theme: string; notifications_enabled: boolean; colour_scheme: any }>): Promise<QueryResult> => {
  const { theme, notifications_enabled, colour_scheme } = updates;

  return await pool.query(
    `UPDATE user_settings 
     SET theme = COALESCE($2, theme), 
         notifications_enabled = COALESCE($3, notifications_enabled), 
         colour_scheme = COALESCE($4, colour_scheme) 
     WHERE user_id = $1 
     RETURNING *`,
    [user_id, theme, notifications_enabled, colour_scheme ? JSON.stringify(colour_scheme) : null]
  );
};

// ✅ Reset user settings to default
export const resetUserSettings = async (user_id: string): Promise<QueryResult> => {
  return await pool.query(
    `UPDATE user_settings 
     SET theme = $2, notifications_enabled = $3, colour_scheme = $4 
     WHERE user_id = $1 
     RETURNING *`,
    [user_id, defaultSettings.theme, defaultSettings.notifications_enabled, JSON.stringify(defaultSettings.colour_scheme)]
  );
};

// ✅ Delete user settings (if needed, but usually handled by ON DELETE CASCADE)
export const deleteUserSettings = async (user_id: string): Promise<QueryResult> => {
  return await pool.query(`DELETE FROM user_settings WHERE user_id = $1 RETURNING *`, [user_id]);
};
