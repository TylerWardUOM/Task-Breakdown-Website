//authController.ts
import dotenv from "dotenv";
import { Request, Response } from "express";
import * as admin from "firebase-admin";
import { createUserInDB, getUserByFirebaseUID } from "../models/userModel";  // Assuming the user model is in the correct directory


dotenv.config();

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  // If environment variable contains JSON string, parse it
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
  // Fallback to local file path for local development
  serviceAccount = require("../../serviceAccountKey.json");
}

// Initialize Firebase Admin with the service account
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Register function on the backend (Node.js / Express)
export const register = async (req: Request, res: Response): Promise<void> => {
    const { token, username, email } = req.body; // Extract username, email, and token
  
    if (!token || !username || !email) {
      res.status(400).json({ error: "Firebase token, username, and email are required" });
      return;
    }
  
    try {
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { uid } = decodedToken;
  
      // Store user in PostgreSQL or any other DB with username, email, and uid
      const result = await createUserInDB(uid, email, username);  // Modify `createUserInDB` to handle username
      console.log("User saved in DB:", result);
  
      res.status(201).json({
        message: "User registered successfully",
        uid,
        email,
        username,  // Return the username too in the response
      });
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(500).json({ error: "Error registering user" });
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
