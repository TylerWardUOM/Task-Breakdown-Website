// userModel.ts
import pool from '../config/db';  // Import the database connection
import { QueryResult } from 'pg';  // Import QueryResult for typing

// Create a new user in the database
export const createUserInDB = async (firebase_uid: string, email: string, username: string): Promise<QueryResult> => {
  const result = await pool.query(
    `INSERT INTO users (firebase_uid, email, username) 
     VALUES ($1, $2, $3) 
     RETURNING *`,  // RETURNING * to return the newly created user record
    [firebase_uid, email, username]
  );
  return result;
};

// Get a user by Firebase UID
export const getUserByFirebaseUID = async (firebaseUID: string) => {
    const query = `SELECT * FROM users WHERE firebase_uid = $1`;
    const result = await pool.query(query, [firebaseUID]);
  
    if (result.rows.length === 0) {
      return null; // No user found
    }
  
    return result.rows[0]; // Return the first row (user object)
  };

// Update user details (e.g., email)
export const updateUserDetails = async (user_id: number, email: string, username: string): Promise<QueryResult> => {
  const result = await pool.query(
    `UPDATE users 
     SET email = $1 
     WHERE id = $2 
     RETURNING *`,
    [email, user_id, username]
  );
  return result;
};

export const getUserByID = async (userId: number) => {
    const query = 'SELECT * FROM users WHERE id = $1'; // Query to fetch user by internal ID
    const values = [userId];
  
    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Return the first matching row
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new Error("Error fetching user");
    }
  };

  // Function to get user by Firebase UID
export const getUserByUID = async (uid: string) => {
    try {
      // Query the database to find the user by the Firebase UID
      const result = await pool.query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [uid]  // Use parameterized queries to prevent SQL injection
      );
  
      // Check if the user exists
      if (result.rows.length === 0) {
        return null;  // No user found with the provided UID
      }
  
      // Return the user data (assuming the user table has fields like id, email, username)
      return result.rows[0];  // Returning the first user found
    } catch (error) {
      console.error('Error fetching user by UID:', error);
      throw new Error('Error fetching user from database');
    }
  };
