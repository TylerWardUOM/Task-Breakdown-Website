import express from 'express';
import { getUserSettingsController, updateUserSettingsController, resetUserSettingsController } from '../controllers/userSettingsController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();
router.use(verifyToken)
// Get user settings
router.get('/get', getUserSettingsController);

// Update user settings
router.put('/update', updateUserSettingsController);

// Reset user settings to default
router.post('/reset', resetUserSettingsController);

export default router;
