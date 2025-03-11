"use client"; // Ensure it's a client-side module

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import { app } from "./firebase"; // Import Firebase config
import { FirebaseError } from "firebase/app";

const auth = getAuth(app);

export const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw new Error("Error signing up");
    }
  };
  
export const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw new Error("Error signing in");
    }
  };
  
// Function to log out
export const logout = async () => {
  await signOut(auth);
};


export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent!");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Error sending password reset email");
  }
};

export const signUpEmailVerification = async (
  email: string,
  password: string,
  username: string,
  setIsSigningUp: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    setIsSigningUp(true); // Mark user as in the process of signing up

    // Step 1: Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Send email verification
    await sendEmailVerification(user);
    await signOut(auth);

    // Step 3: Get Firebase ID token
    const token = await user.getIdToken();

    // Step 4: Send user details to the backend SQL database
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, username }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to register user in the database.");
    }

    // If everything is successful, reset the flag
    setIsSigningUp(false); // Reset the flag after signup is done
    return { success: true, message: "Registration successful! Please verify your email before logging in." };
  } catch (error) {
    console.error("Error signing up:", error);

    // Ensure the flag is reset if there's an error
    setIsSigningUp(false);

    // If it's a Firebase error, throw it to be handled in RegisterPage
    if (error instanceof FirebaseError) {
      throw error;
    }

    // Otherwise, throw a generic error
    throw new Error("An unknown error occurred during sign-up.");
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

export const signInEmailVerification = async (
  email: string,
  password: string,
  setIsSigningUp: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setIsSigningUp(true); // Mark user as in the process of signing in

  try {
    // Firebase Sign In
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 1: Check if email is verified
    if (!user.emailVerified) {
      return { emailVerified: false }; // Return a flag indicating email is not verified
    }

    // Step 2: Get Firebase Token
    const token = await user.getIdToken();
    if (!token) {
      throw new Error("Failed to retrieve authentication token.");
    }

    // Step 3: Send token to backend for verification
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });


    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed.");
    }
    markUserAsVerified(token,email);
    setIsSigningUp(false); // Reset flag after success
    return { emailVerified: true, user: data.user }; // Return success and user data

  } catch (error) {
    console.error("Error Logging in:", error);
    setIsSigningUp(false);

    if (error instanceof FirebaseError) {
      throw error;
    }

    throw new Error("An unknown error occurred during Login.");
  }
};

const markUserAsVerified = async (token: string, email: string) => {
  try {
    // Send a request to the backend to mark the user as verified
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/markVerified`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to mark user as verified.");
    }
    if (data.message != "User is already verified."){
      console.log(`User ${email} marked as verified successfully`);
    }
  } catch (error) {
    console.error("Error marking user as verified:", error);
    throw new Error("Failed to mark user as verified.");
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
  setIsSigningUp: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    setIsSigningUp(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, username }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed.");
    }

    setIsSigningUp(false);
    return { success: true, message: "Please verify your email before logging in." };
  } catch (error) {
    setIsSigningUp(false);
    console.error("Sign-up error:", error);
    throw new Error("Sign-up failed.");
  }
};

export const signInEmailVerificationCookies = async (
  email: string,
  password: string,
  setIsSigningUp: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setIsSigningUp(true);

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed.");
    }

    setIsSigningUp(false);
    return { emailVerified: true, user: data.user };
  } catch (error) {
    setIsSigningUp(false);
    console.error("Login error:", error);
    throw new Error("Login failed.");
  }
};
