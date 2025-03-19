interface User {
  id: number;
  email: string;
  username: string;
}

/**
 * Fetch user data using authentication token stored in cookies.
 */
export const getUserData = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 🔥 Automatically sends cookies with the request
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }
      if (response.status === 404) {
        console.error("User not found in database.");
        return null
      }
      throw new Error("Failed to fetch user data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new Error("Error fetching user data");
  }
};
