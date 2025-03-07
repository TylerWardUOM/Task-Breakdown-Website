import { Request, Response } from 'express';
import { 
  createCategoryInDB, 
  getCategoriesFromDB, 
  updateCategoryInDB, 
  deleteCategoryInDB, 
  getCategoryById
} from '../models/categoryModel';

// Create a new category (Only user-created categories)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;  // No need for is_default since default categories are hardcoded
  const user_id = req.user?.id; // Extract user ID from authenticated request

  if (!user_id) {
    res.status(400).json({ error: 'User not authenticated' });
    return;
  }

  try {
    // Only allow user-created categories
    const result = await createCategoryInDB(user_id, name);
    res.status(201).json(result.rows[0]);
    return; // Ensures function exits after sending response
  } catch (err) {
    res.status(500).json({ error: 'Error creating category' });
    return; // Ensures function exits after sending response
  }
};

// Get all categories for a user (including default ones)
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const user_id = req.user?.id; // Extract user ID

  if (!user_id) {
    res.status(400).json({ error: 'User not authenticated' });
    return;
  }

  try {
    // Fetch user-created categories along with the default ones
    const result = await getCategoriesFromDB(user_id);
    res.status(200).json(result.rows);
    return; // Ensures function exits after sending response
  } catch (err) {
    res.status(500).json({ error: 'Error fetching categories' });
    return; // Ensures function exits after sending response
  }
};

// Update a user-created category (Default categories cannot be updated)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { categoryId } = req.params;
  const { name } = req.body;  // Only name can be updated for user-created categories
  const user_id = req.user?.id; // Extract user ID from authenticated request

  if (!user_id) {
    res.status(400).json({ error: 'User not authenticated' });
    return;
  }

  try {
    // Ensure categoryId is a number
    const categoryIdNum = parseInt(categoryId, 10);
    if (isNaN(categoryIdNum)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }

    // Fetch the category and check if it's user-created
    const categoryResult = await getCategoryById(user_id, categoryIdNum);
    const category = categoryResult.rows[0]; // Extract the category from the result

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    if (category.is_default) {
      res.status(400).json({ error: 'Cannot update default categories.' });
      return; // Ensures function exits after sending response
    }

    const result = await updateCategoryInDB(categoryIdNum, name);
    res.status(200).json(result.rows[0]);
    return; // Ensures function exits after sending response
  } catch (err) {
    res.status(500).json({ error: 'Error updating category' });
    return; // Ensures function exits after sending response
  }
};

// Delete a user-created category (Default categories cannot be deleted)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { categoryId } = req.params;
  const user_id = req.user?.id; // Extract user ID from authenticated request

  if (!user_id) {
    res.status(400).json({ error: 'User not authenticated' });
    return;
  }

  try {
    // Ensure categoryId is a number
    const categoryIdNum = parseInt(categoryId, 10);
    if (isNaN(categoryIdNum)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }

    // Fetch the category and check if it's user-created
    const categoryResult = await getCategoryById(user_id, categoryIdNum);
    const category = categoryResult.rows[0]; // Extract the category from the result

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    if (category.is_default) {
      res.status(400).json({ error: 'Cannot delete default categories.' });
      return; // Ensures function exits after sending response
    }

    await deleteCategoryInDB(categoryIdNum);
    res.status(200).json({ message: 'Category deleted successfully' });
    return; // Ensures function exits after sending response
  } catch (err) {
    res.status(500).json({ error: 'Error deleting category' });
    return; // Ensures function exits after sending response
  }
};
