import { Router } from 'express';
import { 
  createCategory, 
  getCategories, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';  // Assuming your controller is in `controllers`
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();
router.use(verifyToken)

// Route to create a new category
router.post('/create', createCategory);

// Route to get all categories (including default ones) for the authenticated user
router.get('/list', getCategories);

// Route to update a user-created category
router.put('/update', updateCategory);

// Route to delete a user-created category
router.delete('/delete', deleteCategory);

export default router;
