// task_dashboard.js

async function fetchTaskDetails(taskId) {
    try {
        const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const taskData = await response.json();
            displayTaskDetails(taskData);
            fetchSubtasks(taskId); // Fetch subtasks once we have the task details
        } else {
            alert('Error fetching task details.');
        }
    } catch (error) {
        console.error('Error fetching task details:', error);
    }
}
async function enterFocusMode(task_id,subtask_id) {
    window.location.href = (`focusMode.html?task_id=${task_id}&subtask_id=${subtask_id}`)
}

async function fetchSubtasks(taskId) {
    try {
        const response = await fetch(`http://localhost:5000/subtasks?task_id=${taskId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const subtasks = await response.json();
            const subtaskList = document.getElementById('subtask-list');
            subtaskList.innerHTML = ''; // Clear existing subtasks

            subtasks.forEach(subtask => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <input type="checkbox" class="subtask-checkbox" data-id="${subtask.subtask_id}" ${subtask.status === 'completed' ? 'checked' : ''} />
                    <span>${subtask.title} (Estimated: ${subtask.time_estimate} hours)</span>
                    <button class="button" onclick="editSubtask(${subtask.subtask_id})">Edit</button>
                    <button class="button" onclick="enterFocusMode(${taskId},${subtask.subtask_id})">Enter Focus Mode</button>
                `;
                subtaskList.appendChild(li);

                // Add event listener for checkbox to toggle status
                const checkbox = li.querySelector('.subtask-checkbox');
                checkbox.addEventListener('change', () => toggleSubtaskStatus(subtask.subtask_id, checkbox.checked,taskId));
            });

            // Update analytics section
            updateAnalytics(subtasks);
        } else {
            alert('Error fetching subtasks.');
        }
    } catch (error) {
        console.error('Error fetching subtasks:', error);
    }
}


// Function to toggle subtask status and update analytics
async function toggleSubtaskStatus(subtaskId, isCompleted,taskId) {
    const newStatus = isCompleted ? 'completed' : 'pending';

    try {
        const response = await fetch(`http://localhost:5000/subtasks/${subtaskId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            // Re-fetch all subtasks to get the updated data
            const subtasksResponse = await fetch(`http://localhost:5000/subtasks?task_id=${taskId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (subtasksResponse.ok) {
                const updatedSubtasks = await subtasksResponse.json();
                updateAnalytics(updatedSubtasks);  // Update analytics with the new subtask data
            } else {
                console.error('Error fetching updated subtasks for analytics.');
            }
        } else {
            alert('Error updating subtask status.');
        }
    } catch (error) {
        console.error('Error updating subtask status:', error);
    }
}




function displayTaskDetails(task) {
    document.getElementById('task-title').innerText = task.title;
    document.getElementById('task-description').innerText = task.description;
}

function updateAnalytics(subtasks) {
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(subtask => subtask.status === 'completed').length;
    const completionPercentage = ((completedSubtasks / totalSubtasks) * 100) || 0;
    
    document.getElementById('completion-percentage').innerText = `${completionPercentage.toFixed(2)}%`;
    document.getElementById('total-time-spent').innerText = `${calculateTotalTimeSpent(subtasks)} hours`;
    document.getElementById('estimated-time-remaining').innerText = `${calculateEstimatedTimeRemaining(subtasks)} hours`;
}

function calculateTotalTimeSpent(subtasks) {
    return subtasks.reduce((total, subtask) => total + subtask.time_spent, 0);
}

function calculateEstimatedTimeRemaining(subtasks) {
    return subtasks.reduce((total, subtask) => total + subtask.time_estimate - subtask.time_spent, 0);
}


async function deleteTask(taskId) {
    try {
        const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error deleting task: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('An error occurred while deleting the task. Please try again.');
    }
}

// task_dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const deleteButton = document.getElementById('delete-task-button');
    const editButton = document.getElementById('edit-task-button');

    if (deleteButton) {
        deleteButton.addEventListener('click', async (event) => {
            event.preventDefault();

            const confirmed = confirm('Are you sure you want to delete this task?');
            if (confirmed) {
                await deleteTask(taskId); // Call the deleteTask function with the task ID
                window.location.href = 'dashboard.html'; // Redirect to the dashboard
            }
        });
    }
    if (editButton){
        editButton.addEventListener('click', async (event) => {
            window.location.href = `new_task.html?taskId=${taskId}&edit=true`
        })
    }
});



// Get the task ID from the URL parameters and fetch task details
const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get('task_id'); // Example: /task_dashboard.html?task_id=1

if (taskId) {
    fetchTaskDetails(taskId);
}
