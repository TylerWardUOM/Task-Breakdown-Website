import { Request, Response } from "express";
import {
    createSubtaskInDB,
    getSubtasksFromDB,
    getSubtaskByIdFromDB,
    updateSubtaskInDB,
    completeSubtaskInDB,
    deleteSubtaskInDB,
    uncompleteSubtaskFromDB
} from "../models/subtaskModel";

// Create a new subtask
export const createSubtask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { task_id, title, description, duration, importance_factor, order } = req.body;

        if (!task_id || !title) {
            res.status(400).json({ message: "Task ID and title are required" });
            return;
        }

        const newSubtask = await createSubtaskInDB(task_id, title, description, duration, importance_factor, order);
        res.status(201).json(newSubtask.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating subtask", error: err });
    }
};

// Get all subtasks for a specific task
export const getSubtasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { task_id } = req.params;

        if (!task_id) {
            res.status(400).json({ message: "Task ID is required" });
            return;
        }

        const subtasks = await getSubtasksFromDB(Number(task_id));
        res.status(200).json(subtasks.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching subtasks", error: err });
    }
};

// Get a single subtask by ID
export const getSubtaskById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { subtask_id } = req.params;

        if (!subtask_id) {
            res.status(400).json({ message: "Subtask ID is required" });
            return;
        }

        const subtask = await getSubtaskByIdFromDB(Number(subtask_id));

        if (subtask.rows.length === 0) {
            res.status(404).json({ message: "Subtask not found" });
            return;
        }

        res.status(200).json(subtask.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching subtask", error: err });
    }
};

// Update a subtask
export const updateSubtask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { subtask_id } = req.params;
        const { title, description, duration, importance_factor, order, is_deleted} = req.body;

        if (!subtask_id) {
            res.status(400).json({ message: "Subtask ID is required" });
            return;
        }

        const updatedSubtask = await updateSubtaskInDB(Number(subtask_id), title, description, duration, importance_factor, order, is_deleted);
        res.status(200).json(updatedSubtask.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating subtask", error: err });
    }
};

// Mark a subtask as completed
export const completeSubtask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { subtask_id } = req.params;

        if (!subtask_id) {
            res.status(400).json({ message: "Subtask ID is required" });
            return;
        }

        const completedSubtask = await completeSubtaskInDB(Number(subtask_id));
        res.status(200).json(completedSubtask.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error completing subtask", error: err });
    }
};

  // Unmark a subtask as completed (mark it as incomplete)
  export const uncompleteSubtask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { subtask_id } = req.params;

        if (!subtask_id) {
            res.status(400).json({ message: 'Invalid task ID' });
            return;
        }

        const uncompletedSubtask = await uncompleteSubtaskFromDB(Number(subtask_id));
        res.status(200).json(uncompletedSubtask.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error unmarking Subtask as completed', error: err });
    }
};

// Delete a subtask
export const deleteSubtask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { subtask_id } = req.params;

        if (!subtask_id) {
            res.status(400).json({ message: "Subtask ID is required" });
            return;
        }

        const deletedSubtask = await deleteSubtaskInDB(Number(subtask_id));
        res.status(200).json(deletedSubtask.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting subtask", error: err });
    }
};
