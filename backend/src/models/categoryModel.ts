import pool from '../config/db';  // Import the database connection
import { QueryResult } from 'pg';  // Import QueryResult for typing

// Create a new category for a user
export const createCategoryInDB = async (user_id: number | null, name: string): Promise<QueryResult> => {
  const result = await pool.query(
    `INSERT INTO categories (user_id, name, is_default) 
     VALUES ($1, $2, FALSE)  -- No default flag for user-created categories
     RETURNING *`,
    [user_id, name]
  );
  return result;
};

// Get all categories (including user-created and default categories)
export const getCategoriesFromDB = async (user_id: number | null): Promise<QueryResult> => {
  const result = await pool.query(
    `SELECT * FROM categories 
     WHERE user_id = $1 OR is_default = TRUE  -- Include default categories for all users
     ORDER BY is_default DESC, name`,
    [user_id]
  );
  return result;
};

// Get a category by ID (handles both user-created and default categories)
export const getCategoryById = async (user_id: number | null, category_id: number): Promise<QueryResult> => {
    const result = await pool.query(
      `SELECT * FROM categories WHERE (id = $1 AND (user_id = $2 OR user_id IS NULL))`,
      [category_id, user_id]  // This ensures only the current user or default categories are returned
    );
    return result;
  };
  

// Update a category's name
export const updateCategoryInDB = async (category_id: number, name: string): Promise<QueryResult> => {
  // Check if the category is a default category
  const checkCategoryResult = await pool.query(
    `SELECT is_default FROM categories WHERE id = $1`,
    [category_id]
  );

  // If the category doesn't exist or it's a default category, return an error
  if (checkCategoryResult.rows.length === 0) {
    throw new Error('Category not found');
  }

  if (checkCategoryResult.rows[0].is_default) {
    throw new Error('Cannot update default categories');
  }

  // Proceed with the update if it's not a default category
  const result = await pool.query(
    `UPDATE categories 
     SET name = $1 
     WHERE id = $2 
     RETURNING *`,
    [name, category_id]
  );

  return result;
};

// Delete a category
export const deleteCategoryInDB = async (category_id: number): Promise<QueryResult> => {
  // Check if the category is a default category first
  const checkCategoryResult = await pool.query(
    `SELECT is_default FROM categories WHERE id = $1`,
    [category_id]
  );

  // If the category doesn't exist or it's a default category, return an error
  if (checkCategoryResult.rows.length === 0) {
    throw new Error('Category not found');
  }

  if (checkCategoryResult.rows[0].is_default) {
    throw new Error('Cannot delete default categories');
  }

  // Proceed with deletion if it's not a default category
  const result = await pool.query(
    `DELETE FROM categories WHERE id = $1 RETURNING *`,
    [category_id]
  );

  return result;
};
