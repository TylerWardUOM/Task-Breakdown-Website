import { app } from "./firebase";
import { getAuth } from "firebase/auth";

export const refreshAuthToken = async () => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
  
      if (!user) throw new Error("No authenticated user found");
  
      // ✅ Get a fresh token from Firebase
      const newToken = await user.getIdToken(true);
  
      // ✅ Send the new token to the API to store it in cookies
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: newToken }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to set auth token");
      }
  
      console.log("✅ Token refreshed and stored successfully");
    } catch (error) {
      console.error("❌ Error refreshing token:", error);
      throw error;
    }
  };
  