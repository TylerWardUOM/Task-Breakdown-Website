import { getAuth } from "firebase/auth";
import { app } from "./firebase"; // Your Firebase app initialization file

const auth = getAuth(app); // Firebase authentication instance

export const getUserData = async (): Promise<any> => {
  try {
    // Get the current user from Firebase authentication
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No authenticated user found");
    }

    // Get the Firebase ID token (you might need to call getIdToken() asynchronously)
    const idToken = await user.getIdToken();

    // Make the API request to the backend to fetch user data
    const response = await fetch('http://localhost:5000/api/user/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`, // Use the Firebase ID token for authorization
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    // Parse and return the JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('Error fetching user data');
  }
};
