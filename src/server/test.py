# create_test_data.py

import os
import sqlite3
from datetime import datetime, timedelta

# Function to connect to the database
def get_db_connection():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # Go up two levels
    db_path = os.path.join(base_dir, 'data', 'task_manager.db')
    conn = sqlite3.connect(db_path)
    return conn  # Return the connection object directly

def create_sample_data():
    # Sample users (you may want to create a user first)
    user_id = 2  # Assume this user already exists

    # Sample tasks
    tasks = [

    ]

    # Sample subtasks
    subtasks = [
        {"task_id": 4, "title": "Subtask 1.1", "time_estimate": "1 hour", "order_num": 1},
        {"task_id": 4, "title": "Subtask 1.2", "time_estimate": "30 minutes", "order_num": 2},
        {"task_id": 4, "title": "Subtask 2.1", "time_estimate": "2 hours", "order_num": 1},
    ]

    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Insert tasks
        for task in tasks:
            cursor.execute("""
                INSERT INTO Tasks (user_id, title, description, due_date, status)
                VALUES (?, ?, ?, ?, 'pending')
            """, (user_id, task["title"], task["description"], task["due_date"]))

        # Insert subtasks
        for subtask in subtasks:
            cursor.execute("""
                INSERT INTO Subtasks (task_id, title, time_estimate, order_num, status)
                VALUES (?, ?, ?, ?, 'pending')
            """, (subtask["task_id"], subtask["title"], subtask["time_estimate"], subtask["order_num"]))

        conn.commit()

    print("Sample data created successfully.")

if __name__ == '__main__':
    create_sample_data()
