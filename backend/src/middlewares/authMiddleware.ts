import { Request, Response, NextFunction } from "express";
import { getUserByUID } from "../models/userModel";
import admin from "../config/firebase";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; // Define a proper user type instead of `any` if needed
    }
  }
}

// Verify Firebase ID token middleware (now reads from cookies)
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log("🔍 [verifyToken] Middleware triggered");

  // ✅ Extract token from cookies instead of headers
  const token = req.cookies?.authToken;
  console.log("📌 Token from Cookie:", token);

  if (!token) {
    console.warn("❌ No token found in cookies");
    res.status(401).json({ error: "Unauthorized - No token provided" });
    return;
  }

  try {
    console.log("🔍 [verifyToken] Verifying token...");

    // ✅ Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ Decoded Token:", decodedToken);

    // ✅ Fetch the user from the database using the UID from the token
    const user = await getUserByUID(decodedToken.uid);
    console.log("📌 Retrieved User from DB:", user);

    if (!user) {
      console.warn("⚠️ User not found in the database for UID:", decodedToken.uid);
      res.status(404).json({ error: "User not found in the database" });
      return;
    }

    // ✅ Attach user data to the request object
    req.user = user;
    console.log("✅ [verifyToken] User attached to request:", req.user);

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
