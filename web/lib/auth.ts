"use client"; // Ensure it's a client-side module

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "./firebase"; // Import Firebase config

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

// Function to get the current user's Firebase token
export const getFirebaseToken = async () => {
  const user = auth.currentUser;
  if (user) return await user.getIdToken();
  return null;
};
