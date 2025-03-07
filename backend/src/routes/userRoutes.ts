//userRoutes.ts
import { Router } from 'express';
import {getUser } from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();
router.use(verifyToken)

// User routes
router.get('/me', getUser);  // Get current user data

export default router;
