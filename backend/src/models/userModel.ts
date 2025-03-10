// userModel.ts
import pool from '../config/db';  // Import the database connection
import { QueryResult } from 'pg';  // Import QueryResult for typing
import admin from '../config/firebase';

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


// Function to set the user as verified in the database
export const setUserAsVerifiedDB = async (id: number): Promise<QueryResult> => {
  try{
    const result = await pool.query(
      `UPDATE users 
      SET is_verified = TRUE 
      WHERE id = $1 AND is_verified = FALSE 
      RETURNING *`,  // Only update if user is not already verified
      [id]
    );

    return result; // Return updated user information
  } catch (error) {
    console.error('An error occurred while marking user as verified', error);
    throw new Error('Failed to mark user as verified.');
  }
};

// Function to delete unverified users from DB and Firebase
export const deleteUnverifiedUsersFromDB = async (): Promise<number> => {
  try {
    // Find unverified users older than 30 days
    const result = await pool.query(
      `SELECT id, email, firebase_uid FROM users 
       WHERE is_verified = FALSE AND created_at < NOW() - INTERVAL '14 days'`
    );

    const usersToDelete = result.rows;

    if (usersToDelete.length === 0) {
      console.log("No unverified users to delete.");
      return 0;
    }

    for (const user of usersToDelete) {
      console.log(`Deleting user: ${user.email}`);

      // Remove from PostgreSQL
      await pool.query(`DELETE FROM users WHERE id = $1`, [user.id]);

      // Attempt to remove from Firebase Auth
      try {
        await admin.auth().deleteUser(user.firebase_uid);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          console.warn(`Warning: Firebase user not found for ${user.email}, skipping Firebase deletion.`);
        } else {
          console.error(`Error deleting Firebase user for ${user.email}:`, error);
        }
      }
    }

    console.log(`Deleted ${usersToDelete.length} unverified users.`);
    return usersToDelete.length;
  } catch (error) {
    console.error('Error deleting unverified users:', error);
    throw new Error('Failed to delete unverified users.');
  }
};
