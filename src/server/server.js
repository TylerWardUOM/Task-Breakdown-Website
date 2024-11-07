// server.js
// This file sets up an Express server that interacts with a SQLite database,
// executes Python scripts for investment calculations and scraping, and 
// provides RESTful API endpoints for client requests.

const express = require('express'); // Import Express framework
const sqlite3 = require('sqlite3').verbose(); // Import SQLite3 for database interactions
const cors = require('cors'); // Import CORS middleware to allow cross-origin requests
const { exec } = require('child_process'); // Import exec to run Python scripts
const cron = require('node-cron'); // Import node-cron for scheduling tasks
const path = require('path'); // Import path module for handling file paths
require('dotenv').config(); // Load environment variables from .env file


const app = express(); // Create an Express application
const pycmd = process.env.pycmd || 'python'
const PORT = process.env.PORT || 80; // Use PORT from env or default to 80
const HOST = process.env.HOST || 'localhost'; // Use HOST from env or default to localhost

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON request bodies

console.log('Starting server...'); // Log to console when server starts



// Start the Express server
app.listen(PORT, () => {
    console.log(`Server running on http://${HOST}:${PORT}`); // Log server running message
});
