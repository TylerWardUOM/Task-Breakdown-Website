import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import admin from "firebase-admin";

// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("🔥 Firebase Admin initialization failed:", error);
  }
}

// Define expected Firebase error structure
interface FirebaseAuthError extends Error {
  code?: string;
}

export async function GET() {
  try {
    const token = (await cookies()).get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { isAuthenticated: false, user: null, error: "No authentication token found." },
        { status: 401 } // Unauthorized
      );
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await admin.auth().getUser(decodedToken.uid);

    return NextResponse.json(
      { isAuthenticated: true, user: { email: user.email, uid: user.uid } },
      { status: 200 } // OK
    );
  } catch (error) {
    const authError = error as FirebaseAuthError;
    console.error("❌ Error verifying token:", authError);

    let errorMessage = "Authentication failed.";
    let statusCode = 500; // Internal Server Error

    // Handle specific Firebase authentication errors
    switch (authError.code) {
      case "auth/argument-error":
        errorMessage = "Invalid token format.";
        statusCode = 400; // Bad Request
        break;
      case "auth/id-token-expired":
        errorMessage = "Token has expired (Unauthorized). Please log in again.";
        statusCode = 401; // Unauthorized
        break;
      case "auth/invalid-id-token":
        errorMessage = "Invalid authentication token.";
        statusCode = 401; // Unauthorized
        break;
      case "auth/user-not-found":
        errorMessage = "User not found.";
        statusCode = 404; // Not Found
        break;
    }

    return NextResponse.json(
      { isAuthenticated: false, user: null, error: errorMessage },
      { status: statusCode }
    );
  }
}
