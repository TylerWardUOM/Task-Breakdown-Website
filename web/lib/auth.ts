"use client"; // Ensure it's a client-side module

import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, UserCredential, GoogleAuthProvider } from "firebase/auth";
import { app } from "./firebase"; // Import Firebase config
import { markUserAsVerified, registerUserInDatabase } from "./api";

const auth = getAuth(app);




export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent!");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Error sending password reset email");
  }
};



export const resendVerificationEmail = async (email: string,password: string) => {
  try {
    const user = await signInWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(user.user); // Send verification email again
    return { success: true, message: "Verification Email Sent Succesfully" };
  } catch (err) {
    console.error("Error sending verification email:", err);
    throw new Error("Failed to send verification email. Please try again later.");
  }
};




export const logoutCookies = async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
};


export const signUpEmailVerificationCookies = async (
  email: string,
  password: string,
  username: string,
  userCredential: UserCredential | null
) => {
  try {
    let requestBody: Record<string, unknown> = { email, password, username };

    if (userCredential) {
      // Handle Google sign-in
      const credential = GoogleAuthProvider.credentialFromResult(userCredential);
      if (!credential) {
        throw new Error("Google authentication failed. No credential found.");
      }

      const idToken = credential.idToken; // Firebase ID token
      const accessToken = credential.accessToken; // Google access token (optional)

      if (!idToken) {
        throw new Error("Failed to retrieve ID token from Google authentication.");
      }

      requestBody = { idToken, accessToken, google: true };
      email = userCredential.user.email || email;
      username = userCredential.user.displayName || username; // Default to username if displayName is null
    }

    // Step 1: Register with Firebase API
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (!response.ok) {
      // Ensure proper error handling
      if (data.error && typeof data.error === "object") {
        return {
          errorCode: data.error.code || "auth/unknown-error",
          errorMessage: data.error.message || "An unknown authentication error occurred.",
        };
      }
      throw new Error("Register failed.");
    }

    // Step 2: Register user in the SQL database
    const responseDB = await registerUserInDatabase(email, username);
    if (!responseDB.success) {
      throw new Error(responseDB.errorCode || "Failed to register user in the database.");
    }

    return { success: true, message: "Registration successful! Please verify your email before logging in." };
  } catch (error) {
    console.error("Sign-up error:", error);
    return {
      errorCode: "auth/unknown-error",
      errorMessage: error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
};


export const signInEmailVerificationCookies = async (
  email: string,
  password: string,
  userCredential: UserCredential | null
) => {
  try {
    let requestBody: Record<string, unknown> = { email, password };

    if (userCredential) {
      // Handle Google sign-in
      const credential = GoogleAuthProvider.credentialFromResult(userCredential);
      if (!credential) {
        throw new Error("Google authentication failed. No credential found.");
      }

      const idToken = credential.idToken; // Firebase ID token
      const accessToken = credential.accessToken; // Google access token (optional)

      if (!idToken) {
        throw new Error("Failed to retrieve ID token from Google authentication.");
      }

      requestBody = { idToken, accessToken, google: true };
      email = userCredential.user.email || email;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      // Ensure the error response format is handled properly
      if (data.error && typeof data.error === "object") {
        return {
          errorCode: data.error.code || "auth/unknown-error",
          errorMessage: data.error.message || "An unknown authentication error occurred.",
        };
      }

      // Handle specific case where email is not verified
      if (data.error === "Email not verified.") {
        return { emailVerified: false };
      }

      throw new Error("Login failed.");
    }

    // Mark user as verified only if email is defined
    if (email) {
      markUserAsVerified(email);
    }

    return { emailVerified: true, user: data.user };
  } catch (error) {
    console.error("Login error:", error);

    return {
      errorCode: "auth/unknown-error",
      errorMessage: error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
};
