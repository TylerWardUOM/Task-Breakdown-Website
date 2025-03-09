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

// Function to get the current user's Firebase token
export const getFirebaseToken = async () => {
  const user = auth.currentUser;
  if (user) return await user.getIdToken();
  return null;
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



export const signInEmailVerification = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 1: Check if the email is verified
    if (!user.emailVerified) {
      throw new Error("Please verify your email before logging in.");
    }

    return user; // Proceed with login after verification
  } catch (error: unknown) {
    console.error("Error signing in:", error);
    throw new Error("Error signing in");
  }
};
