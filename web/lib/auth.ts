"use client"; // Ensure it's a client-side module

import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, UserCredential, GoogleAuthProvider, deleteUser } from "firebase/auth";
import { app } from "./firebase"; // Import Firebase config
import { markUserAsVerified, registerUserInDatabase} from "./api";

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


const handleAuthResponse = async (requestBody: { email?: string; password?: string; username?: string; idToken?: string; accessToken?: string | undefined; google?: boolean; }) => {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    return response.ok
      ? { success: true, user: data.user, message: data.message }
      : { errorCode: data.error?.code || "auth/unknown-error", errorMessage: data.error?.message || "Registration failed." };
  } catch (error) {
    console.error("Sign-up error:", error);
    return {
      errorCode: "auth/network-error",
      errorMessage: error instanceof Error ? error.message : "Network error occurred.",
    };
  }
};

export const signUpWithEmailPassword = async (email: string, password: string, username: string) => {
  const requestBody = { email, password, username };
  const authResponse = await handleAuthResponse(requestBody);

  if (!authResponse.success || !authResponse.user) {
    return {
      errorCode: authResponse.errorCode || "auth/unknown-error",
      errorMessage: authResponse.errorMessage || "An unknown authentication error occurred.",
    };
  }

  const user = authResponse.user; // Get the Firebase user

  const dbResponse = await registerUserInDatabase(email, username);
  if (!dbResponse.success) {
    if (dbResponse.errorCode) {
      if (dbResponse.errorCode != "auth/user-already-exists"){
        await deleteUser(user);
      }
      return {
        errorCode: dbResponse.errorCode,
        errorMessage: dbResponse.errorMessage || "Database registration failed.",
      };
    }

    // Delete Firebase user only if it's another database failure
    return {
      errorCode: "auth/db-registration-failed",
      errorMessage: "Failed to add user to database. Account has been removed.",
    };
  }
    return authResponse; // Return successful auth response
};

export const signUpWithGoogle = async (userCredential: UserCredential) => {
  try {
    if (!userCredential) throw new Error("Google authentication failed. No credential found.");

    const credential = GoogleAuthProvider.credentialFromResult(userCredential);
    if (!credential) throw new Error("Failed to retrieve Google credential.");

    const idToken = credential.idToken;
    const accessToken = credential.accessToken;
    if (!idToken) throw new Error("Failed to retrieve ID token from Google authentication.");

    const email = userCredential.user.email;
    if (!email) throw new Error("Google authentication failed. No email found in user profile.");

    const username = userCredential.user.displayName || email.split("@")[0];

    // Step 1: Authenticate with Firebase
    const requestBody = { idToken, accessToken, google: true };
    const authResponse = await handleAuthResponse(requestBody);

    if (!authResponse.success || !authResponse.user) {
      return {
        errorCode: authResponse.errorCode || "auth/unknown-error",
        errorMessage: authResponse.errorMessage || "An unknown authentication error occurred.",
      };
    }

    const user = authResponse.user;

    // Step 2: Register user in the database
    const dbResponse = await registerUserInDatabase(email, username);

    // Step 3: Pass all error codes from the database
    if (!dbResponse.success) {
      if (dbResponse.errorCode) {
        if (dbResponse.errorCode != "auth/user-already-exists"){
          await deleteUser(user);
        }
        return {
          errorCode: dbResponse.errorCode,
          errorMessage: dbResponse.errorMessage || "Database registration failed.",
        };
      }

      // Delete Firebase user only if it's another database failure
      return {
        errorCode: "auth/db-registration-failed",
        errorMessage: "Failed to add user to database. Account has been removed.",
      };
    }

    return authResponse; // Return successful auth response
  } catch (error) {
    console.error("Google sign-up error:", error);

    return {}
};
}



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
