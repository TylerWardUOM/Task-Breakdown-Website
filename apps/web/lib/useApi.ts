import { useRouter } from "next/navigation";
import { refreshAuthToken } from "./refreshAuthToken";

export const useApi = () => {
  const router = useRouter();

  const apiCall = async <T>(apiFunction: () => Promise<T>): Promise<T> => {
    try {
      return await apiFunction(); // Call the API function
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        console.warn("Token expired, attempting refresh...");

        try {
          const { success, shouldRedirect } = await refreshAuthToken();

          if (shouldRedirect) {
            console.error("Token refresh failed, redirecting to login.");
            router.push("/login"); // 🔥 Redirect if refresh fails
            throw new Error("Session expired. Redirecting to login.");
          }

          if (success) {
            return await apiFunction(); // 🔄 Retry API call after refreshing token
          }
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          router.push("/login"); // 🔥 Redirect on failure
          throw refreshError;
        }
      }

      throw error; // Pass other errors normally
    }
  };

  return { apiCall };
};
