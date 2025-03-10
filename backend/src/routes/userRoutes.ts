//userRoutes.ts
import { Router } from 'express';
import {getUser, markVerified } from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();
router.use(verifyToken)

// User routes
router.get('/me', getUser);  // Get current user data
router.post('/markVerified', markVerified);  // Get current user data

export default router;
