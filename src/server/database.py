import sqlite3
import os

# Database connection and setup
class Databasee:
    @staticmethod
    def connect():
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # Go up two levels
        db_path = os.path.join(base_dir, 'data', 'task_manager.db')
        conn = sqlite3.connect(db_path)
        return conn  # Return the connection object directly

    @staticmethod
    def setup():
        conn = Database.connect()
        cursor = conn.cursor()
        cursor.execute("""CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )""")
        cursor.execute("""CREATE TABLE IF NOT EXISTS Tasks (
            task_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            due_date DATE,
            status TEXT DEFAULT 'pending',
            time_spent INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )""")
        cursor.execute("""CREATE TABLE IF NOT EXISTS Subtasks (
            subtask_id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER,
            title TEXT NOT NULL,
            time_estimate INTEGER,
            time_spent INTEGER DEFAULT 0,
            order_num INTEGER,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (task_id) REFERENCES Tasks(task_id)
        )""")
        conn.commit()
        conn.close()

Database = Databasee()
Database.setup()