import { TaskResponse } from "../types/Task";

export async function getTaskBreakdown(task: string): Promise<TaskResponse | null> {
  try {
    const response = await fetch("/api/task/breakdown", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task }),
    });

    if (!response.ok) {
      console.error("API Error:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching task breakdown:", error);
    return null;
  }
}
