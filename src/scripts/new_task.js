document.getElementById('add-task-button').addEventListener('click', addTask);
document.getElementById('add-subtask-button').addEventListener('click', addSubtask);
document.getElementById('finish-task-button').addEventListener('click', finishTask);
document.getElementById('cancel-button').addEventListener('click', cancelTask);
document.getElementById('edit-task-button').addEventListener('click', editTask);

let taskId = null;
const subtasks = [];
let taskDetailsVisible = false;

function getURLParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
}

window.onload = async function() {
    const isEditMode = getURLParameter('edit') === 'true';
    const taskId = getURLParameter('taskId');

    if (isEditMode && taskId) {
        document.getElementById('add-task-button').style.display = 'none';
        document.getElementById('edit-task-button').style.display = 'block';

        document.getElementById('finish-task-button').textContent = 'Finish Editing Task';


        // Load existing task data and display the task details
        await loadExistingTaskData(taskId);
        
        // Display task details and subtask section
        document.getElementById('task-form').style.display = 'none'; // Hide form since we are in edit mode
        document.getElementById('subtask-section').style.display = 'block';
        document.getElementById('finish-task-button').style.display = 'block';
    } else {
        // Default to create mode
        document.getElementById('add-task-button').style.display = 'block';
        document.getElementById('edit-task-button').style.display = 'none';
    }
};

// Updated `loadExistingTaskData` function to call `displayTaskDetails` after fetching data
// Fetch and load existing task data, including subtasks
async function loadExistingTaskData(taskId) {
    try {
        const taskResponse = await fetch(`http://localhost:5000/tasks/${taskId}`);
        if (taskResponse.ok) {
            const taskData = await taskResponse.json();
            displayTaskDetails(taskData.title, taskData.description, taskData.due_date);

            const fetchedSubtasks = await fetchSubtasks(taskId);
            if (fetchedSubtasks && Array.isArray(fetchedSubtasks)) {
                // Populate global subtasks array
                subtasks.length = 0; // Clear existing subtasks to avoid duplication
                fetchedSubtasks.forEach(subtask => {
                    subtasks.push(subtask); // Add each fetched subtask to global array
                    addSubtaskToList(subtask); // Display each subtask
                });
            } else {
                console.error("No subtasks found or an error occurred.");
            }
        } else {
            alert('Error loading task data');
        }
    } catch (error) {
        console.error('Error loading task data:', error);
    }
}

async function fetchSubtasks(taskId) {
    try {
        const response = await fetch(`http://localhost:5000/subtasks?task_id=${taskId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const subtasks = await response.json();
            console.log("Fetched subtasks:", subtasks);
            return subtasks; // Return fetched subtasks array
        } else {
            console.error("Error fetching subtasks:", response.statusText);
            return [];
        }
    } catch (error) {
        console.error("Network error while fetching subtasks:", error);
        return [];
    }
}




async function addTask() {
    const taskName = document.getElementById('task-name').value;
    const taskDescription = document.getElementById('task-description-form').value;
    const dueDate = document.getElementById('due-date').value;

    if (!taskName || !taskDescription || !dueDate) {
        alert('Please fill in all required fields before adding the task.');
        return;
    }

    const userId = localStorage.getItem('user_id');
    if (!userId) {
        alert('User ID not found. Please log in again.');
        return;
    }

    document.getElementById('task-form').style.display = 'none';
    displayTaskDetails(taskName, taskDescription, dueDate);
}

function displayTaskDetails(title, description, dueDate) {
    const taskDetailsSection = document.createElement('div');
    taskDetailsSection.id = 'task-details';
    taskDetailsSection.innerHTML = `
        <h2>Task Info:</h2>
        <p><strong>Title:</strong> <span id="task-title">${title}</span></p>
        <p><strong>Description:</strong> <span id="task-description">${description}</span></p>
        <p><strong>Due Date:</strong> <span id="task-due-date">${dueDate}</span></p>
    `;

    const subtaskSection = document.getElementById('subtask-section');
    subtaskSection.insertAdjacentElement('beforebegin', taskDetailsSection);

    document.getElementById('subtask-section').style.display = 'block';
    document.getElementById('finish-task-button').style.display = 'block';
    document.getElementById('edit-task-button').style.display = 'block';
}

function addSubtask() {
    const subtaskTitle = document.getElementById('subtask-title').value;
    const timeEstimate = document.getElementById('time-estimate').value;

    if (!subtaskTitle || !timeEstimate) {
        alert('Please fill in all required subtask fields before adding the subtask.');
        return;
    }

    const subtask = { title: subtaskTitle, time_estimate: timeEstimate };
    subtasks.push(subtask);
    addSubtaskToList(subtask);

    document.getElementById('subtask-title').value = '';
    document.getElementById('time-estimate').value = '';
}

function addSubtaskToList(subtask) {
    const subtaskList = document.getElementById('subtasks');
    const subtaskItem = document.createElement('div');
    subtaskItem.className = 'subtask-item';
    subtaskItem.innerHTML = `
        <span>${subtask.title} - Estimated time: ${subtask.time_estimate} hrs</span>
        <button class="edit-subtask-button">Edit</button>
        <button class="delete-subtask-button">Delete</button>
    `;
    subtaskList.appendChild(subtaskItem);

    subtaskItem.querySelector('.delete-subtask-button').addEventListener('click', function() {
        const index = subtasks.indexOf(subtask);
        if (index > -1) {
            subtasks.splice(index, 1);
            subtaskList.removeChild(subtaskItem);
        }
    });

    subtaskItem.querySelector('.edit-subtask-button').addEventListener('click', function() {
        alert('Edit functionality not implemented yet.');
    });
}



async function finishTask() {
    const isEditMode = getURLParameter('edit') === 'true';
    const taskId = getURLParameter('taskId');
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
        alert('User ID not found. Please log in again.');
        return;
    }

    // Gather the main task details
    const taskTitle = document.getElementById('task-title').innerText;
    const taskDescription = document.getElementById('task-description').innerText;
    const taskDueDate = document.getElementById('task-due-date').innerText;

    // Create task payload with full subtasks array
    const taskData = {
        title: taskTitle,
        description: taskDescription,
        due_date: taskDueDate,
        user_id: userId,
        subtasks: subtasks // Ensure this array includes all subtasks, existing and new
    };

    const requestMethod = isEditMode ? 'PUT' : 'POST';
    const endpoint = isEditMode ? `http://localhost:5000/tasks/${taskId}` : 'http://localhost:5000/tasks';

    try {
        const response = await fetch(endpoint, {
            method: requestMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        if (response.ok) {
            alert(`Task ${isEditMode ? 'updated' : 'created'} successfully!`);
            window.location.href = 'dashboard.html'; // Redirect to the dashboard
        } else {
            const errorData = await response.json();
            alert(`Error ${isEditMode ? 'updating' : 'creating'} task: ${errorData.error}`);
            console.error('Error response:', errorData);
        }
    } catch (error) {
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} task:`, error);
        alert(`An error occurred while ${isEditMode ? 'updating' : 'creating'} the task. Please try again.`);
    }
}


function cancelTask() {
    window.location.href = 'dashboard.html'; // Redirect to the dashboard
}

let originalTitle, originalDescription, originalDueDate;

function editTask() {
    // Get current task details and save them
    originalTitle = document.getElementById('task-title').innerText;
    originalDescription = document.getElementById('task-description').innerText;
    originalDueDate = document.getElementById('task-due-date').innerText;

    // Create input fields with the current values as defaults
    const taskDetailsSection = document.getElementById('task-details');
    taskDetailsSection.innerHTML = `
        <h2>Edit Task:</h2>
        <p>
            <strong>Title:</strong>
            <input type="text" id="edit-task-title" value="${originalTitle}" required>
        </p>
        <p>
            <strong>Description:</strong>
            <input type="text" id="edit-task-description" value="${originalDescription}" required>
        </p>
        <p>
            <strong>Due Date:</strong>
            <input type="date" id="edit-task-due-date" value="${originalDueDate}" required>
        </p>
        <button id="save-task-button">Save Changes</button>
        <button id="cancel-edit-button">Cancel</button>
    `;

    // Attach event listeners for save and cancel buttons
    document.getElementById('save-task-button').addEventListener('click', saveTask);
    document.getElementById('cancel-edit-button').addEventListener('click', cancelEdit);
}


function saveTask() {
    // Get references to the input fields
    const newTitle = document.getElementById('edit-task-title').value;
    const newDescription = document.getElementById('edit-task-description').value;
    const newDueDate = document.getElementById('edit-task-due-date').value;

    // Validate inputs
    if (!newTitle || !newDescription || !newDueDate) {
        alert('Please fill in all fields before saving.');
        return;
    }


    // Recreate task details section to reflect the changes
    const taskDetailsSection = document.getElementById('task-details');
    taskDetailsSection.innerHTML = `
        <h2>Task Info:</h2>
        <p><strong>Title:</strong> <span id="task-title">${newTitle}</span></p>
        <p><strong>Description:</strong> <span id="task-description">${newDescription}</span></p>
        <p><strong>Due Date:</strong> <span id="task-due-date">${newDueDate}</span></p>
    `;

    // Show the subtask section and the finish button again
    document.getElementById('subtask-section').style.display = 'block';
    document.getElementById('finish-task-button').style.display = 'block';
    document.getElementById('edit-task-button').style.display = 'block'; // Show edit button again

    alert('Task details updated successfully!');
}

function cancelEdit() {
    // Restore original task details in the DOM
    const taskDetailsSection = document.getElementById('task-details');
    taskDetailsSection.innerHTML = `
        <h2>Task Info:</h2>
        <p><strong>Title:</strong> <span id="task-title">${originalTitle}</span></p>
        <p><strong>Description:</strong> <span id="task-description">${originalDescription}</span></p>
        <p><strong>Due Date:</strong> <span id="task-due-date">${originalDueDate}</span></p>
    `;

    // Show the subtask section and finish button again
    document.getElementById('subtask-section').style.display = 'block';
    document.getElementById('finish-task-button').style.display = 'block';
    document.getElementById('edit-task-button').style.display = 'block'; // Show edit button again

    alert('Edit cancelled.');
}





// Retrieve and display the username
async function displayUsername() {
    const userId = localStorage.getItem('user_id'); // Make sure this is set when the user logs in
    if (!userId) {
        document.getElementById('current-username').textContent = 'Guest';
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/username?user_id=${userId}`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById('current-username').textContent = `${data.username}`;
        } else {
            document.getElementById('current-username').textContent = 'Guest';
        }
    } catch (error) {
        console.error('Error fetching username:', error);
        document.getElementById('current-username').textContent = 'Guest';
    }
}

displayUsername()



// Call the function when the script loads
displayUsername();
