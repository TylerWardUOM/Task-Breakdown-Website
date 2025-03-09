"use client"; // Ensure it's a client-side module

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import { app } from "./firebase"; // Import Firebase config
import { ref, set } from "firebase/database";
import { db } from "./firebase";  // Assuming you have initialized Realtime Database

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




export const signInEmailVerification = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 1: Check if the email is verified
    if (!user.emailVerified) {
      throw new Error("Please verify your email before logging in.");
    }

    // Step 2: Check if this is the user's first login by checking if their data exists in the Firebase Realtime Database
    const userRef = ref(db, 'users/' + user.uid);  // Use user.uid to get the user's data
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      throw new Error("User data not found in database. Please complete registration.");
    }

    // Retrieve the stored username and other user info
    const userData = userSnapshot.val();
    const username = userData.username;
    const email = userData.email;

    // Step 3: Check if the user is already in your custom backend database (First login check)
    const token = await user.getIdToken(); // Get Firebase ID token

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/checkUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, email, username }), // Send the token, email, and username to your backend
    });

    const data = await response.json();

    if (response.ok) {
      console.log("User successfully logged in.");
      // If the user is not yet in the database, register them
      if (!data.userExists) {
        // Send the token, email, and username to register the user in the backend
        const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, email, username }), // Include the necessary details
        });

        const registerData = await registerResponse.json();

        if (registerResponse.ok) {
          console.log("User registered in the database:", registerData);
        } else {
          throw new Error(registerData.error || "Failed to register user in the database.");
        }
      }

      return user; // Proceed with the sign-in process if all checks pass
    } else {
      throw new Error(data.error || "Error checking user in the database.");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error signing in:", error.message);
      throw new Error(error.message || "Error signing in");
    } else {
      console.error("Unknown error occurred:", error);
      throw new Error("An unknown error occurred.");
    }
  }
};


export const signUpEmailVerification = async (email: string, password: string, username: string) => {
  try {
    // Step 1: Create user with email and password using Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Send email verification
    await sendEmailVerification(user);  // Send the email verification

    // Step 3: Save user info to Firebase Realtime Database
    const userRef = ref(db, 'users/' + user.uid);  // Use user.uid as the key to store user data
    await set(userRef, {
      username: username,
      email: email,
      emailVerified: false,  // Set emailVerified as false initially
    });

    // Return the user object (optional, depending on how you want to use it)
    return user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw new Error("Error signing up");
  }
};