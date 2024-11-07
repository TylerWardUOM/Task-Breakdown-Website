// script.js

async function handleSignUp(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Account created for ${data.username}!`);
            // Redirect to login or perform other actions
            window.location.href = 'login.html'; // Replace with actual redirect
        } else {
            const errorData = await response.json();
            alert(errorData.error);
        }
    } catch (error) {
        console.error('Error during sign up:', error);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Welcome back, ${data.username}!`);
            localStorage.setItem('user_id', data.user_id);
            // Redirect to dashboard or perform other actions
            window.location.href = 'dashboard.html'; // Replace with actual redirect
        } else {
            const errorData = await response.json();
            alert(errorData.error);
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

async function fetchTasks() {
    const userId = localStorage.getItem('user_id'); // Assume user_id is stored after login
    try {
        const response = await fetch(`http://localhost:5000/tasks?user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const tasks = await response.json();
            const taskList = document.querySelector('.task-list ul');
            taskList.innerHTML = ''; // Clear any previous task entries

            if (tasks.length === 0) {
                // If no tasks, display a message
                taskList.innerHTML = '<li class="no-tasks-message">You currently have no active tasks.</li>';
            } else {
                // If there are tasks, populate the task list
                tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.className = 'task-item';
                    li.innerHTML = `
                        <span class="task-title">${task.title}</span>
                        <span class="task-due-date">Due: ${task.due_date}</span>
                        <span class="task-status">${task.status}</span>
                        <div class="task-actions">
                            <a href="task_dashboard.html?task_id=${task.task_id}" class="button">View</a>
                            <a href="new_task.html?taskId=${task.task_id}&edit=true" class="button">Edit</a>
                            <a href="#" class="button delete-task-button" data-task-id="${task.task_id}">Delete</a>
                        </div>
                    `;
                    taskList.appendChild(li);

                    // Add delete button event listener for each task
                    const deleteButton = li.querySelector('.delete-task-button');
                    deleteButton.addEventListener('click', async (event) => {
                        event.preventDefault();
                        const confirmed = confirm(`Are you sure you want to delete the task "${task.title}"?`);
                        if (confirmed) {
                            await deleteTask(task.task_id);
                            li.remove(); // Remove the task from the DOM after deletion

                            // Check if there are no tasks left after deletion
                            if (!taskList.querySelector('.task-item')) {
                                taskList.innerHTML = '<li class="no-tasks-message">You currently have no active tasks.</li>';
                            }

                            alert(`Task "${task.title}" deleted successfully.`);
                        }
                    });
                });
            }
        } else {
            alert('Error fetching tasks.');
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
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

// Check if we are on the dashboard page and then call fetchTasks
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', (event) => {
        fetchTasks(); // Fetch tasks when the dashboard page is loaded
    });
}

// Function to navigate to a different page
function goToPage(url) {
    window.location.href = url; // You can also use window.location.assign(url);
}

// Handle logout
document.getElementById('logout-button').addEventListener('click', function() {
    localStorage.removeItem('user_id'); // Clear user ID from local storage
    alert('You have been logged out.');
    window.location.href = 'login.html'; // Redirect to login page
});

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