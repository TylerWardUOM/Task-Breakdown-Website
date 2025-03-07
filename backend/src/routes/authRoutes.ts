//authRoutes.ts
import { Router } from "express";
import {  register, login, resetPassword } from "../controllers/authController";
import {verifyToken} from "../middlewares/authMiddleware";

// Create a new Router instance
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-token', verifyToken);
router.post('/reset-password', resetPassword);


// Export the router to be used in your server.ts
export default router;
