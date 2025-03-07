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
  console.log("🔍 [verifyToken] Middleware triggered");

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  console.log("📌 Authorization Header:", authHeader);

  const token = authHeader?.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;

  if (!token) {
    console.warn("❌ No token found in Authorization header");
    res.status(401).json({ error: "Unauthorized - No token provided" });
    return;
  }

  try {
    console.log("🔍 [verifyToken] Verifying token...");

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ Decoded Token:", decodedToken);

    // Fetch the user from the database using the UID from the token
    const user = await getUserByUID(decodedToken.uid);
    console.log("📌 Retrieved User from DB:", user);

    if (!user) {
      console.warn("⚠️ User not found in the database for UID:", decodedToken.uid);
      res.status(404).json({ error: "User not found in the database" });
      return;
    }

    // Attach user data (including user ID) to the request object
    req.user = user;
    console.log("✅ [verifyToken] User attached to request:", req.user);

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
