// app/api/task/breakdown.ts

import { TaskBreakdownResponse, TaskDuration } from "@FrontendTypes/AiResponse";
import { Subtask_data, Task_data } from "@GlobalTypes/Task";


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MOCK = true;

export async function getTaskBreakdown(task: string): Promise<TaskBreakdownResponse | null> {
    try {
    console.log("🔹 Received a request to break down task");

    if (MOCK){
    const mockResponse: TaskBreakdownResponse = {
        main_task: {
          title: "Write an essay on Shakespeare's Othello",
          description: "Compose an essay analyzing Shakespeare's Othello using secondary sources that need to be referenced.",
          duration: { hours: 3, minutes: 0 },
          due_date: null, // Matches AI-generated response
          importance_factor: null, // AI does not assign this
          repeat_interval: null, // AI does not handle repetition
          category_id: null, // Default to null
        },
        subtasks: [
          {
            title: "Research secondary sources",
            description: "Find and gather secondary sources related to Othello.",
            duration: { hours: 1, minutes: 0 },
            importance_factor: 10,
            order: 1
          },
          {
            title: "Read and take notes on sources",
            description: "Read the gathered secondary sources and take detailed notes.",
            duration: { hours: 1, minutes: 0 },
            importance_factor: 8,
            order: 2
          },
          {
            title: "Create an outline for the essay",
            description: "Draft a structured outline for the essay based on the notes.",
            duration: { hours: 0, minutes: 30 },
            importance_factor: 8,
            order: 3
          },
          {
            title: "Write the introduction",
            description: "Compose the introduction section of the essay.",
            duration: { hours: 0, minutes: 30 },
            importance_factor: 8,
            order: 4
          },
          {
            title: "Write body paragraphs",
            description: "Write the body paragraphs of the essay using the outline.",
            duration: { hours: 1, minutes: 0 },
            importance_factor: 10,
            order: 5
          },
          {
            title: "Write the conclusion",
            description: "Compose the conclusion section of the essay.",
            duration: { hours: 0, minutes: 30 },
            importance_factor: 8,
            order: 6
          },
          {
            title: "Cite sources and format bibliography",
            description: "Reference all secondary sources used and format the bibliography.",
            duration: { hours: 0, minutes: 30 },
            importance_factor: 8,
            order: null
          },
          {
            title: "Proofread and edit the essay",
            description: "Review the essay for any grammatical or structural errors.",
            duration: { hours: 0, minutes: 30 },
            importance_factor: 10,
            order: null
          }
        ]
      };
    
      return mockResponse;
    }

    if (!OPENAI_API_KEY) {
        console.error("❌ OPENAI_API_KEY is missing");
        throw new Error("Server misconfiguration: API key missing");
    }

    console.log("📩 Task received:", task);

    // OpenAI API Request
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that breaks down tasks into a structured JSON format. 
          Always return the response as a valid JSON object containing:

          - **main_task**: an object with:
            - **title** (string)  
            - **description** (string)  
            - **duration**  (object with { "hours": integer, "minutes": integer })  

          - **subtasks**: an array where each subtask has:
            - **title** (string)  
            - **description** (string)  
            - **duration** (object with { "hours": integer, "minutes": integer })  
            - **importance_factor** (integer from 1 to 10, where 1 is least critical and 10 is most urgent/important). Use urgency, dependencies, and impact to determine this value.
            - **order** (integer, starting from 1, representing the suggested execution order). If a subtask can be completed in any order, return "order": null or omit the field.

          **Duration Formatting:**  
          - If a task takes **less than an hour**, return as { "hours": 0, "minutes": X }.  
          - If a task takes **1 hour or more**, return as { "hours": X, "minutes": Y }.  

          **Task Breakdown Rules:**  
          - Split the task only into **logical, necessary steps** based on the given information.  
          - If additional breakdown requires missing details (e.g., number of items), do not guess—keep the subtask as a single step.  

          **Example Response Format:**
          {
            "main_task": {
              "title": "Complete lab report",
              "description": "Complete the assigned lab report.",
              "duration": { "hours": 4, "minutes": 0 }
            },
            "subtasks": [
              {
                "title": "Gather oscilloscope images",
                "description": "Collect relevant images...",
                "duration": { "hours": 0, "minutes": 30 },
                "importance_factor": 8
                "order": 1
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Break down this task into a main task and multiple subtasks.  
          Each subtask should be small and manageable, aiming for **around 30 minutes**, but can be shorter or longer if necessary (e.g., 1-2 hours for a single, simple action like inserting images).  
          
          Task: "${task}"  

          Return only a **valid JSON object** in the expected structure.`
        }
      ],
      response_format: { type: "json_object" }, // ✅ Ensures JSON output
      temperature: 0.3
    };

    console.log("🔍 Sending request to OpenAI:", JSON.stringify(requestBody, null, 2));

    // Make the API call
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log("📥 OpenAI API Response Status:", response.status);

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    // Parse the response
    const data = await response.json();
    console.log("📊 OpenAI API Response:", JSON.stringify(data, null, 2));

    const parsedResponse: TaskBreakdownResponse | null = data.choices[0]?.message?.content 
      ? JSON.parse(data.choices[0].message.content) 
      : null;

    if (!parsedResponse || !parsedResponse.main_task || !parsedResponse.subtasks) {
      console.error("❌ Invalid response format from OpenAI");
      throw new Error("Invalid response format from OpenAI");

    }
  

        // Convert AI-generated main task into `Task_data`
        const formattedMainTask: (Omit<Task_data, "taskId" | "duration"> & { duration: TaskDuration | null }) = {
        title: parsedResponse.main_task.title,
        description: parsedResponse.main_task.description,
        due_date: null, // Default to null (can be updated later)
        importance_factor: null, // AI does not assign an importance factor directly
        duration: parsedResponse.main_task.duration, // Ensure duration format
        repeat_interval: null, // AI does not handle repetition
        category_id: null, // Default to null (can be assigned later)
        };


    // Convert subtasks into `SubTask` type
    const formattedSubtasks: (Omit<Subtask_data, "duration"> & {
        duration: TaskDuration | null; // AI returns duration in { hours, minutes }
      })[] = parsedResponse.subtasks.map((subtask) => ({
      subtaskId: undefined,
      title: subtask.title,
      description: subtask.description,
      duration: subtask.duration,
      importance_factor: subtask.importance_factor,
      order: subtask.order,
      is_deleted: undefined,
    }));

    // Create final structured response
    const formattedResponse: TaskBreakdownResponse = {
      main_task: formattedMainTask,
      subtasks: formattedSubtasks
    };

    return formattedResponse;

  } catch (error) {
    console.error("❌ Error in API route:", error);
    return null;
  }
}