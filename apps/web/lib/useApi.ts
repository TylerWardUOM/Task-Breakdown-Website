import { useRouter } from "next/navigation";
import { refreshAuthToken } from "./refreshAuthToken";


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
