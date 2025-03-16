// app/api/task/breakdown.ts
import { NextRequest, NextResponse } from "next/server";
import { TaskBreakdownResponse, TaskDuration, MainTask, SubTask } from "../../../../types/Task";


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("🔹 Received a request to break down task");

    if (!OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY is missing");
      return NextResponse.json(
        { error: "Server misconfiguration: API key missing" },
        { status: 500 }
      );
    }

    const { task } = await req.json();
    if (!task) {
      console.warn("⚠️ Task description is missing");
      return NextResponse.json(
        { error: "Task description is required." },
        { status: 400 }
      );
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
            - **importance_factor** (integer, one of 2, 4, 8, or 10)  

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
      const errorText = await response.text();
      console.error("❌ OpenAI API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch data from OpenAI", details: errorText },
        { status: response.status }
      );
    }

    // Parse the response
    const data = await response.json();
    console.log("📊 OpenAI API Response:", JSON.stringify(data, null, 2));

    const parsedResponse: TaskBreakdownResponse | null = data.choices[0]?.message?.content 
      ? JSON.parse(data.choices[0].message.content) 
      : null;

    if (!parsedResponse || !parsedResponse.main_task || !parsedResponse.subtasks) {
      console.error("❌ Invalid response format from OpenAI");
      return NextResponse.json(
        { error: "Unexpected response format from OpenAI", details: parsedResponse },
        { status: 500 }
      );
    }

    // Function to convert minutes into { hours, minutes }
    const convertMinutesToHours = (minutes: number): TaskDuration => ({
      hours: Math.floor(minutes / 60),
      minutes: minutes % 60
    });

    // Convert main task duration
    const formattedMainTask: MainTask = {
      ...parsedResponse.main_task,
      duration: convertMinutesToHours(parsedResponse.main_task.duration.hours * 60 + parsedResponse.main_task.duration.minutes)
    };

    // Convert subtasks durations
    const formattedSubtasks: SubTask[] = parsedResponse.subtasks.map((subtask) => ({
      ...subtask,
      duration: convertMinutesToHours(subtask.duration.hours * 60 + subtask.duration.minutes)
    }));

    // Create final structured response
    const formattedResponse: TaskBreakdownResponse = {
      main_task: formattedMainTask,
      subtasks: formattedSubtasks
    };

    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error("❌ Error in API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
