// focusMode.js

let timerInterval;
let elapsedTime = 0; // Tracks time spent on the selected task or subtask in seconds
let selectedTaskId = null;
let selectedSubtaskId = null;
let totalLoggedTime = 0; // Total time that has been logged across sessions
let isPaused = false; // Track if the timer is currently paused

// Initialize Focus Mode
async function initFocusMode(taskId = null, subtaskId = null) {
    await loadTaskOptions(); // Load task options first

    // Set selected task ID and subtask ID
    if (taskId) {
        selectedTaskId = taskId;
        const task = await loadTaskDetails(selectedTaskId);
        let taskTitle = task.title;

        if (subtaskId) {
            selectedSubtaskId = subtaskId;
            const subtask = await loadSubtaskDetails(selectedSubtaskId);
            document.getElementById('current-task-title').textContent = `Currently working on: ${taskTitle} (Subtask: ${subtask.title})`;
        } else {
            document.getElementById('current-task-title').textContent = `Currently working on: ${taskTitle}`;
        }
        document.getElementById('current-task-title').style.display = 'block';
    } else {
        document.getElementById('current-task-title').style.display = 'none';
    }

    // After loading task options, set selected task and load corresponding subtasks
    if (selectedTaskId) {
        document.getElementById('task-selector').value = selectedTaskId; // Set the task selector
        await loadSubtaskOptions(selectedTaskId); // Load subtasks for the selected task
        if (selectedSubtaskId) {
            document.getElementById('subtask-selector').value = selectedSubtaskId; // Set the subtask selector
        }
    }
}

// Load task details for display
async function loadTaskDetails(taskId) {
    const response = await fetch(`http://localhost:5000/tasks/${taskId}`);
    if (response.ok) {
        return await response.json(); // Return the task object directly
    }
    console.error("Failed to load task details:", response.status);
}

// Load subtask details for display
async function loadSubtaskDetails(subtaskId) {
    const response = await fetch(`http://localhost:5000/subtasks/${subtaskId}`);
    if (response.ok) {
        return await response.json(); // Return the subtask object directly
    }
    console.error("Failed to load subtask details:", response.status);
}

// Load task options into the sidebar dropdown
async function loadTaskOptions() {
    const userId = localStorage.getItem('user_id');
    const response = await fetch(`http://localhost:5000/tasks?user_id=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
        const tasks = await response.json();
        const taskSelector = document.getElementById('task-selector');
        taskSelector.innerHTML = '<option value="">Select Task</option>'; // Default option

        tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.task_id; // Ensure the task ID is set correctly
            option.textContent = task.title; // Set the displayed text
            taskSelector.appendChild(option);
        });

        // Event listener for task selection
        taskSelector.addEventListener('change', async (event) => {
            selectedTaskId = event.target.value; // Get the selected task ID
            selectedSubtaskId = null; // Reset subtask selection

            if (selectedTaskId) {
                // Load task details and display immediately
                const task = await loadTaskDetails(selectedTaskId);
                document.getElementById('current-task-title').textContent = `Currently working on: ${task.title}`;
                document.getElementById('current-task-title').style.display = 'block'; // Show title

                // Load subtasks based on selected task
                await loadSubtaskOptions(selectedTaskId);
            } else {
                // Clear displayed task details if no task is selected
                document.getElementById('current-task-title').textContent = '';
                document.getElementById('current-task-title').style.display = 'none'; // Hide title
            }
        });
    } else {
        console.error("Failed to load tasks:", response.status);
        alert("Could not load tasks. Please check the server.");
    }
}

// Load subtask options based on selected task
async function loadSubtaskOptions(taskId) {
    const subtaskSelector = document.getElementById('subtask-selector');

    // Reset subtasks
    if (subtaskSelector) {
        subtaskSelector.innerHTML = '<option value="">Select Subtask</option>'; // Reset subtasks

        try {
            const response = await fetch(`http://localhost:5000/subtasks?task_id=${taskId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const subtasks = await response.json();
                subtasks.forEach(subtask => {
                    const option = document.createElement('option');
                    option.value = subtask.subtask_id;
                    option.textContent = subtask.title;
                    subtaskSelector.appendChild(option);
                });

                // Set the selected subtask if it exists
                if (selectedSubtaskId) {
                    subtaskSelector.value = selectedSubtaskId; // Set the selected subtask
                }

                // Add event listener for subtask selection
                subtaskSelector.addEventListener('change', async (event) => {
                    selectedSubtaskId = event.target.value; // Get selected subtask ID
                    const task = await loadTaskDetails(selectedTaskId); // Fetch task details again

                    // Check if the selected subtask is the default option
                    if (selectedSubtaskId === "") {
                        // Default option selected; update title to only show task title
                        document.getElementById('current-task-title').textContent = `Currently working on: ${task.title}`;
                        selectedSubtaskId = null; // Reset the selected subtask ID
                    } else {
                        // Update title to show both task and subtask
                        const subtask = await loadSubtaskDetails(selectedSubtaskId);
                        document.getElementById('current-task-title').textContent = `Currently working on: ${task.title} (Subtask: ${subtask.title})`;
                    }
                });
            }
        } catch (error) {
            console.error("Failed to load subtasks:", error);
            alert("Could not load subtasks. Please try again later.");
        }
    }
}



// Initialize Focus Mode (remains unchanged)
// ...

// Timer Controls
function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            elapsedTime++;
            updateTimerDisplay();
            updateProgressBar();
        }, 1000); // Update every second
        isPaused = false; // Reset paused state when starting
    }
}

async function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;

        // Log the time spent up to this pause
        const time_done = elapsedTime;
        if (selectedTaskId) {
            await logTimeSpent(selectedTaskId, 'task', time_done);
            totalLoggedTime += time_done; // Accumulate logged time for the task
        }

        if (selectedSubtaskId) {
            await logTimeSpent(selectedSubtaskId, 'subtask', time_done);
            totalLoggedTime += time_done; // Accumulate logged time for the subtask
        }

        console.log("Timer paused. Time logged:", time_done);
        elapsedTime = 0; // Reset elapsed time for the next session
        isPaused = true; // Mark timer as paused
    }
}

async function resetTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;

        // Only log the time spent when the timer is reset completely
        const time_done = totalLoggedTime + elapsedTime; // Total logged time plus any elapsed time
        try {
            if (selectedTaskId) {
                console.log("Logging time for task ID:", selectedTaskId);
                await logTimeSpent(selectedTaskId, 'task', time_done);
            } else {
                console.warn("No task selected for logging.");
            }

            if (selectedSubtaskId) {
                console.log("Logging time for subtask ID:", selectedSubtaskId);
                await logTimeSpent(selectedSubtaskId, 'subtask', time_done);
            } else {
                console.warn("No subtask selected for logging.");
            }

            // Reset elapsedTime and totalLoggedTime after both logs are complete
            elapsedTime = 0;
            totalLoggedTime = 0; // Reset the total logged time
        } catch (error) {
            console.error("Error logging time:", error);
        }
    }

    // Update display and progress after resetting timer
    updateTimerDisplay();
    updateProgressBar();
}




// Update timer display and progress bar
function updateTimerDisplay() {
    const hours = Math.floor(elapsedTime / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').textContent = `${hours}:${minutes}:${seconds}`;
}

// Update progress bar based on elapsed time
function updateProgressBar() {
    const totalTime = 25 * 60; // Total time for the Pomodoro timer (25 minutes)
    const progress = Math.min((elapsedTime / totalTime) * 100, 100); // Calculate percentage
    document.getElementById('progress-bar').style.width = `${progress}%`; // Update the width
}

// Mark task/subtask as complete
async function markComplete() {
    if (selectedSubtaskId) {
        await markSubtaskComplete(selectedSubtaskId);
    } else if (selectedTaskId) {
        await markTaskComplete(selectedTaskId);
    } else {
        alert('No task or subtask selected.');
    }
}

async function markTaskComplete(taskId) {
    await fetch(`http://localhost:5000/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
    });
    await logTimeSpent(taskId, 'task');
    alert('Task marked as complete');
}

async function markSubtaskComplete(subtaskId) {
    await fetch(`http://localhost:5000/subtasks/${subtaskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
    });
    await logTimeSpent(subtaskId, 'subtask');
    alert('Subtask marked as complete');
}

async function logTimeSpent(id, type, time_done) {
    const url = `http://localhost:5000/${type}s/${id}/log_time`;

    // Validate time_done
    if (typeof time_done !== 'number' || isNaN(time_done) || time_done < 0) {
        console.error("Invalid elapsedTime value:", time_done);
        return;
    }

    console.log("Elapsed time before logging:", time_done);
    console.log("Logging time to URL:", url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ time_spent: time_done })
        });

        console.log("Response received:", response);

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error(`Error logging time: ${response.status} ${errorMessage}`);
        }

        const data = await response.json();
        console.log("Success:", data);
    } catch (error) {
        // Capture more details about the error
        console.error("Error logging time:", error);
        console.error("Failed to fetch URL:", url);
        console.error("Request body:", JSON.stringify({ time_spent: time_done }));
    }
}






// Event listeners
document.getElementById('start-btn').addEventListener('click', startTimer);
document.getElementById('pause-btn').addEventListener('click', pauseTimer);
document.getElementById("reset-btn").addEventListener("click", function(event) {
    console.log("Reset button clicked");  // Log click event
    event.preventDefault();  // Prevents the form from submitting
    console.log("Default action prevented"); // Log after preventDefault
    resetTimer(); // Call your function to log time
});

document.getElementById('complete-btn').addEventListener('click', markComplete);

// Initialize with task and subtask IDs from URL
const urlParams = new URLSearchParams(window.location.search);
const taskIdFromUrl = urlParams.get('task_id');
const subtaskIdFromUrl = urlParams.get('subtask_id');
initFocusMode(taskIdFromUrl, subtaskIdFromUrl);
