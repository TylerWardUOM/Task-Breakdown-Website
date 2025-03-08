import { Request, Response } from 'express';
import { 
    createTaskInDB, getTasksFromDB, updateTaskInDB, 
    deleteTaskFromDB, addNoteToTaskInDB, getTaskByIdFromDB, getFilteredTasksFromDB, getTasksWithPaginationFromDB,calculateNextDueDate,
    updateTaskWithNullsDB
} from '../models/taskModel';

// Create a new task
export const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, due_date, importance_factor, duration, repeat_interval, category_id, notes } = req.body;
        const user_id = req.user?.id;  // Use optional chaining

        if (!user_id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const newTask = await createTaskInDB(user_id, title, description, due_date, importance_factor, duration, repeat_interval, category_id, notes);
        res.status(201).json(newTask.rows[0]); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating task', error: err });
    }
};

// Get all tasks for the authenticated user
export const getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.id;
        console.log("User ID from token:", req.user?.id); // ✅ Debugging


        if (!user_id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const tasks = await getTasksFromDB(user_id);
        res.status(200).json(tasks.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching tasks', error: err });
    }
};

// Update a task
export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        // Try to get taskId from URL params, then from the request body if not found
        let taskId = req.params.taskId ? parseInt(req.params.taskId, 10) : NaN;
        if (isNaN(taskId) && req.body.taskId) {
            taskId = parseInt(req.body.taskId, 10);
        }
        if (isNaN(taskId)) {
            res.status(400).json({ message: 'Invalid task ID' });
            return;
        }

        const {
            title,
            description,
            due_date,
            importance_factor,
            duration,
            repeat_interval,
            category_id,
            notes,
            completed,
            completed_at
        } = req.body;

        const updatedTask = await updateTaskInDB(
            taskId,
            title,
            description,
            due_date,
            importance_factor,
            duration,
            repeat_interval,
            category_id,
            notes,
            completed,
            completed_at
        );

        res.status(200).json(updatedTask.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating task', error: err });
    }
};


// Update a task
export const updateTaskWithNull = async (req: Request, res: Response): Promise<void> => {
  try {
      // Try to get taskId from URL params, then from the request body if not found
      let taskId = req.params.taskId ? parseInt(req.params.taskId, 10) : NaN;
      if (isNaN(taskId) && req.body.taskId) {
          taskId = parseInt(req.body.taskId, 10);
      }
      if (isNaN(taskId)) {
          res.status(400).json({ message: 'Invalid task ID' });
          return;
      }

      const {
          title,
          description,
          due_date,
          importance_factor,
          duration,
          repeat_interval,
          category_id,
          notes,
          completed,
          completed_at
      } = req.body;

      const updatedTask = await updateTaskWithNullsDB(
          taskId,
          title,
          description,
          due_date,
          importance_factor,
          duration,
          repeat_interval,
          category_id,
          notes,
          completed,
          completed_at
      );

      res.status(200).json(updatedTask.rows[0]);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating task', error: err });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const taskId = parseInt(req.params.taskId, 10);  // Convert to number
        if (isNaN(taskId)) {
            res.status(400).json({ message: 'Invalid task ID' });
            return;
        }

        await deleteTaskFromDB(taskId);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting task', error: err });
    }
};

// Add a note to a task
export const addNoteToTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const taskId = parseInt(req.params.taskId, 10);  // Convert to number
        if (isNaN(taskId)) {
            res.status(400).json({ message: 'Invalid task ID' });
            return;
        }

        const { note } = req.body;
        const newNote = await addNoteToTaskInDB(taskId, note);
        
        res.status(201).json(newNote.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding note to task', error: err });
    }
};

// Get a single task by ID
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = parseInt(req.params.taskId, 10);  // Convert to number
      if (isNaN(taskId)) {
        res.status(400).json({ message: 'Invalid task ID' });
        return;
      }
  
      const user_id = req.user?.id;
      if (!user_id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
  
      const task = await getTaskByIdFromDB(user_id, taskId);  // Assuming the function will check user ownership of the task
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
  
      res.status(200).json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching task', error: err });
    }
  };

  // Mark a task as completed
export const completeTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = parseInt(req.params.taskId, 10);  // Convert to number
      if (isNaN(taskId)) {
        res.status(400).json({ message: 'Invalid task ID' });
        return;
      }
  
      const completedAt = new Date();  // Get the current timestamp
      const updatedTask = await updateTaskInDB(taskId, null, null, null, null, null, null, null, null, true, completedAt);
      res.status(200).json(updatedTask.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error marking task as completed', error: err });
    }
  };
  


  

// Get filtered tasks
export const getFilteredTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.id;

        if (!user_id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Ensure that query parameters are treated as strings
        const category_id = req.query.category_id ? String(req.query.category_id) : undefined;
        const due_date = req.query.due_date ? String(req.query.due_date) : undefined;
        const importance_factor = req.query.importance_factor ? String(req.query.importance_factor) : undefined;

        const tasks = await getFilteredTasksFromDB(user_id, category_id, due_date, importance_factor);
        res.status(200).json(tasks.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching filtered tasks', error: err });
    }
};

  // Create a repeated task
export const createRepeatedTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId,taskId, repeat_interval } = req.body;
      const task = await getTaskByIdFromDB(userId,taskId);  // Get the task that needs to be repeated
  
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      const nextDueDate = calculateNextDueDate(task.due_date, repeat_interval);  // Calculate the next due date
      const newTask = await createTaskInDB(task.user_id, task.title, task.description, nextDueDate, task.importance_factor, task.duration, task.repeat_interval, task.category_id, task.notes);
      res.status(201).json(newTask.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating repeated task', error: err });
    }
  };

  // Get tasks with pagination
export const getTasksWithPagination = async (req: Request, res: Response): Promise<void> => {
    try {
      const user_id = req.user?.id;
      const { page = 1, limit = 10 } = req.query;  // Default to first page with 10 tasks
  
      if (!user_id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
  
      const tasks = await getTasksWithPaginationFromDB(user_id, parseInt(page.toString(), 10), parseInt(limit.toString(), 10));
      res.status(200).json(tasks.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching tasks', error: err });
    }
  };

  // Unmark a task as completed (mark it as incomplete)
export const uncompleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const taskId = parseInt(req.params.taskId, 10);  // Convert to number
        if (isNaN(taskId)) {
            res.status(400).json({ message: 'Invalid task ID' });
            return;
        }

        const updatedTask = await updateTaskInDB(taskId, null, null, null, null, null, null, null, null, false, null);
        res.status(200).json(updatedTask.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error unmarking task as completed', error: err });
    }
};

  