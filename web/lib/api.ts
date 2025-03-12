import { UserSettings } from "../types/userSettings";
import { Task } from "../types/Task";

export const fetchTasks = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/get`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔥 Ensures cookies (session) are sent
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
};

export const fetchCompletedTasksTimeframe = async (timeframe: string): Promise<number> => {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/completed/${timeframe}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔥 Uses cookies instead of manually passing a token
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }
    throw new Error("Failed to fetch completed tasks");
  }

  const data = await response.json();
  const completedCount = Number(data.completedTasks);

  if (isNaN(completedCount)) {
    throw new Error("Invalid data received for completed tasks");
  }

  return completedCount;
};

export const fetchCategories = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category/list`, // Adjust endpoint as needed
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 🔥 Uses the session cookie
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
};

export const saveUserSettings = async (settings: UserSettings) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/settings/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔥 Uses session cookie instead of token
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error("Failed to save user settings");
  }

  return response.json();
};

export const fetchUserSettings = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/settings/get`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔥 Uses cookies instead of passing a token manually
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user settings");
  }

  return response.json();
};


export const toggleTaskCompletionRequest = async (taskId: number, isCompleted: boolean) => {
  const url = isCompleted
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/${taskId}/uncomplete`
    : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/${taskId}/complete`;

  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔥 Uses cookies instead of manually passing a token
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }
    throw new Error(`Failed to ${isCompleted ? "unmark" : "mark"} task as complete`);
  }

  return response.json(); // Return the updated task data (if needed)
};


export const deleteTaskRequest = async (taskId: number) => {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/delete/${taskId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔥 Uses cookies for authentication
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }
    throw new Error("Failed to delete task");
  }

  return response.json(); // Return response (if needed)
};



export const saveTask = async (taskData: Partial<Task>, existingTask?: Task) => {
  try {
    const endpoint = existingTask
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/updateNulls`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/create`;
    const method = existingTask ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 🔥 Uses cookies for authentication
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(existingTask ? "Failed to update task" : "Failed to create task");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving task:", error);
    throw error;
  }
};

export const registerUserInDatabase = async (email: string, username: string) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 🔥 Uses cookies for authentication
      body: JSON.stringify({email,username}),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error && typeof data.error === "object") {
        return {
          errorCode: data.error.code || "auth/unknown-error",
          errorMessage: data.error.message || "An unknown authentication error occurred.",
        };
      }
      throw new Error("Failed to register user in the database.");
    }

    return { success: true, message: "Registration successful! Please verify your email before logging in." };
  } catch (error) {
    console.error("Database registration error:", error);
    throw error;
  }
};

export const markUserAsVerified = async (email: string) => {
  try {
    const url =  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/markVerified`;
    // Send a request to the backend to mark the user as verified
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 🔥 Uses cookies for authentication
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to mark user as verified.");
    }
    if (data.message != "User is already verified."){
      console.log(`User ${email} marked as verified successfully`);
    }
  } catch (error) {
    console.error("Error marking user as verified:", error);
    throw new Error("Failed to mark user as verified.");
  }
};
