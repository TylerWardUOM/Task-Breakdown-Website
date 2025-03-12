import { Request, Response } from 'express';
import { getUserSettings, updateUserSettings, resetUserSettings, createUserSettings } from '../models/userSettingsModel'; 

// ✅ Get user settings by user ID
export const getUserSettingsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user; // User info is assumed to be set in middleware
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const result = await getUserSettings(user.id);

        if (result.rows.length === 0) {
            const result_create = await createUserSettings(user.id);
            if (result_create.rows.length === 0) {
                res.status(404).json({ error: 'User settings not found' });
            }
            return;
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ✅ Update user settings (partial updates allowed)
export const updateUserSettingsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const updates = req.body; // Expecting theme, notifications_enabled, or colour_scheme in request body
        const result = await updateUserSettings(user.id, updates);

        res.status(200).json({ message: 'Settings updated successfully', settings: result.rows[0] });
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ✅ Reset user settings to default
export const resetUserSettingsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const result = await resetUserSettings(user.id);
        res.status(200).json({ message: 'Settings reset to default', settings: result.rows[0] });
    } catch (error) {
        console.error('Error resetting user settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
