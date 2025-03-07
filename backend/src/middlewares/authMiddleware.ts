import admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import { getUserByUID } from '../models/userModel';  // Import the DB query function

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; // You might want to define a proper user type instead of `any`
    }
  }
}

// Verify Firebase ID token middleware
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Fetch the user from the database using the uid from the token
    const user = await getUserByUID(decodedToken.uid);

    if (!user) {
        res.status(404).json({ error: "User not found in the database" });
      return;
    }

    // Attach user data (including user ID) to the request object
    req.user = user;  // Attach the full user data to req.user (now it will contain the user info from the database)
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
