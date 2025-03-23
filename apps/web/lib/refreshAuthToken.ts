import { auth } from "./firebase";
import { signOut } from "firebase/auth";

export const refreshAuthToken = async (): Promise<{ success: boolean; shouldRedirect: boolean }> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return { success: false, shouldRedirect: true }; // No user found, should redirect to login
    }

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
      if (response.status === 401) {
        console.warn("⚠️ Session expired.");
        await signOut(auth);
        return { success: false, shouldRedirect: true }; // Indicate session expired, should redirect
      }
      throw new Error(data.error || "Failed to refresh auth token");
    }

    console.log("✅ Token refreshed and stored successfully");
    return { success: true, shouldRedirect: false }; // Token refreshed successfully, no redirect needed
  } catch (error) {
    console.error("❌ Error refreshing token:", error);
    return { success: false, shouldRedirect: true }; // If an error occurs, recommend redirecting
  }
};
