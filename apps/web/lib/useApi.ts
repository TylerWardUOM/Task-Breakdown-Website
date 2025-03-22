import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "./firebase";



const refreshAuthToken = async () => {
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



export const useApi = () => {
  const router = useRouter();


const apiCall = async <T>(apiFunction: () => Promise<T>): Promise<T> => {
    try {
    return await apiFunction(); // Call the API function
    } catch (error: unknown) { // 🔹 Use `unknown` instead of `any`
    if (error instanceof Error && error.message.includes("Unauthorized")) {
        console.warn("Token expired, attempting refresh...");

        try {
        await refreshAuthToken(); // 🔄 Refresh token
        return await apiFunction(); // 🔁 Retry API call
        } catch (refreshError) {
        console.error("Token refresh failed, redirecting to login.");
        router.push("/login"); // 🔥 Redirect if refresh fails
        throw refreshError;
        }
    }
    throw error; // Pass other errors normally
    }
  };

  return { apiCall };
};
