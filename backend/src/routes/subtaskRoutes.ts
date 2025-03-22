import { Router } from "express";
import {
    createSubtask,
    getSubtasks,
    getSubtaskById,
    updateSubtask,
    completeSubtask,
    deleteSubtask,
    uncompleteSubtask
} from "../controllers/subtaskController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();
router.use(verifyToken);

// Create a new subtask
router.post("/create", createSubtask);

// Get all subtasks for a specific task
router.get("/task/:task_id", getSubtasks);

// Get a single subtask by ID
router.get("/:subtask_id", getSubtaskById);

// Update a subtask
router.put("/:subtask_id", updateSubtask);

// Mark a subtask as completed
router.patch("/:subtask_id/complete", completeSubtask);

// Mark a subtask as uncompleted
router.patch("/:subtask_id/uncomplete", uncompleteSubtask);

// Delete a subtask
router.delete("/:subtask_id", deleteSubtask);

export default router;
