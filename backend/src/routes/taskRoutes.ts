import { Router } from 'express';
import { 
  createTask, 
  getTasks, 
  updateTask, 
  deleteTask, 
  addNoteToTask, 
  getTaskById, 
  completeTask, 
  getFilteredTasks, 
  createRepeatedTask, 
  getTasksWithPagination,
  uncompleteTask,
  updateTaskWithNull,
  getCompletedTasks,
  getCompletedTasksByTimeframe,
  getDeletedTasks,
  undeleteTask
} from '../controllers/taskController';  // Adjust path as necessary
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();
router.use(verifyToken);
// Route to create a new task
router.post('/create', createTask);

// Route to get all tasks for the authenticated user
router.get('/get', getTasks);

// Route to get a single task by ID
router.get('/get_by_taskId', getTaskById);

// Route to update a task
router.put('/update', updateTask);

router.put('/updateNulls', updateTaskWithNull);

// Get count of completed tasks
router.get('/completed', getCompletedTasks);

// Get count of completed tasks within a timeframe (week, month, last30days, year, last365days)
router.get('/completed/:timeframe', getCompletedTasksByTimeframe);

// Soft delete a task
router.put('/delete/:taskId', deleteTask);

// Restore a deleted task
router.put('/undelete/:taskId', undeleteTask);

// Get all deleted tasks for a user
router.get('/deleted', getDeletedTasks);

// Route to add a note to a task
router.post('/:taskId/addnotes', addNoteToTask);

// Route to mark a task as completed
router.put('/:taskId/complete', completeTask);

router.put('/:taskId/uncomplete', uncompleteTask);


// Route to get filtered tasks based on query parameters (category, due_date, importance_factor)
router.get('/filter', getFilteredTasks);

// Route to create a repeated task
router.post('/taskId/repeat', createRepeatedTask);

// Route to get tasks with pagination (page, limit)
router.get('/pagination', getTasksWithPagination);

export default router;
