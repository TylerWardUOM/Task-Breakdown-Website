import { UserSettings } from "../types/userSettings";

export const fetchTasks = async (firebaseToken: string) => {
    if (!firebaseToken) {
      throw new Error("Authentication is required");
    }
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firebaseToken}`,
      },
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
  
    return response.json(); // Returns the tasks
  };
  
  export const fetchCompletedTasksTimeframe = async (firebaseToken: string, timeframe: string): Promise<number> => {
    if (!firebaseToken) {
      throw new Error("No Firebase token found. Please log in.");
    }
  
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/completed/${timeframe}`;
  
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firebaseToken}`,
      },
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

  export const fetchCategories = async (firebaseToken: string) => {
    if (!firebaseToken) {
      throw new Error("Authentication is required");
    }
  
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category/list`, // Adjust endpoint as needed
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
      }
    );
  
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
  
    return response.json(); // Returns the categories
  };
  

  export const saveUserSettings = async (firebaseToken: string, settings: UserSettings) => {
    if (!firebaseToken) throw new Error("Authentication is required");
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/settings/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firebaseToken}`,
      },
      body: JSON.stringify(settings),
    });
  
    if (!response.ok) throw new Error("Failed to save user settings");
  
    return response.json(); // Returns updated settings
  };
  
  export const fetchUserSettings = async (firebaseToken: string) => {
    if (!firebaseToken) throw new Error("Authentication is required");
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/settings/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firebaseToken}`,
      },
    });
  
    if (!response.ok) throw new Error("Failed to fetch user settings");
  
    return response.json(); // Returns user settings
  };
  