//authController.ts
import { Request, Response } from "express";
import { createUserInDB, getUserByFirebaseUID } from "../models/userModel";  // Assuming the user model is in the correct directory
import admin from "../config/firebase";
import pool from "../config/db";



// Register function on the backend (Node.js / Express)
export const register = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.authToken;
  const { username, email } = req.body;

  // Validate request data
  if (!token || !username || !email) {
    res.status(400).json({ 
      error: { 
        code: "auth/missing-fields", 
        message: "Firebase token, username, and email are required." 
      } 
    });
    return;
  }

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    // Check if user already exists in the database
    const existingUser = await pool.query("SELECT * FROM users WHERE firebase_uid = $1", [uid]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({ 
        error: { 
          code: "auth/user-already-exists", 
          message: "User is already registered in the database." 
        } 
      });
      return;
    }

    // Store user in PostgreSQL
    const result = await createUserInDB(uid, email, username);
    console.log("User saved in DB:", result.rows[0]);

    res.status(201).json({
      message: "User registered successfully.",
      user: result.rows[0], // Send full user details
    });
  } catch (error: any) {
    console.error("Error registering user:", error);

    if (error.code === "23505") {
      // Handle unique constraint violations (email or username already exists)
      res.status(409).json({ 
        error: { 
          code: "auth/duplicate-user", 
          message: "A user with this email or username already exists." 
        } 
      });
      return;
    }

    if (error.code === "auth/argument-error") {
      res.status(400).json({ 
        error: { 
          code: "auth/invalid-token", 
          message: "Invalid or expired Firebase authentication token." 
        } 
      });
      return;
    }

    res.status(500).json({ 
      error: { 
        code: "auth/internal-error", 
        message: "An unexpected error occurred while registering the user." 
      } 
    });
  }
};
  

  
  // Function to log in a user
  export const login = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body; // Token from the frontend
  
    if (!token) {
      res.status(400).json({ error: "Firebase token is required" });
      return;
    }
  
    try {
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { uid } = decodedToken; // Extract UID from decoded token
  
      // Fetch user from PostgreSQL by Firebase UID
      const user = await getUserByFirebaseUID(uid);  // Fetch user from the database
  
      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }
  
      // Return a response with user data
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          uid: user.firebase_uid,
          username: user.username,
        },
      });
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  };

// Password Reset Function
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    await admin.auth().generatePasswordResetLink(email);  // Generate a password reset link for the email
    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Error sending password reset link:", error);
    res.status(500).json({ error: "Error sending password reset link" });
  }
};
