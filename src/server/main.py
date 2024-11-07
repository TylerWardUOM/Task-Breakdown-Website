from flask import Flask, request, jsonify
import sqlite3
import hashlib
from datetime import datetime
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes



# Database connection setup
def get_db_connection():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # Go up two levels
    db_path = os.path.join(base_dir, 'data', 'task_manager.db')
    conn = sqlite3.connect(db_path)
    return conn  # Return the connection object directly

# Utility function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# User Class
class User:
    def __init__(self, user_id, username, email, password_hash=None):
        self.user_id = user_id
        self.username = username
        self.email = email
        self.password_hash = password_hash

    @classmethod
    def register(cls, username, email, password):
        password_hash = hash_password(password)
        with get_db_connection() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute("""
                    INSERT INTO Users (username, email, password_hash) 
                    VALUES (?, ?, ?)
                """, (username, email, password_hash))
                conn.commit()
                print(f"User {username} registered successfully.")
                return cls(cursor.lastrowid, username, email, password_hash)
            except sqlite3.IntegrityError:
                print("Error: User with this email already exists.")
                return None

    @classmethod
    def login(cls, email, password):
        password_hash = hash_password(password)
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT user_id, username FROM Users WHERE email = ? AND password_hash = ?
            """, (email, password_hash))
            user = cursor.fetchone()
            if user:
                user_id, username = user
                cursor.execute("UPDATE Users SET last_login = ? WHERE user_id = ?", (datetime.now(), user_id))
                conn.commit()
                print(f"Login successful. Welcome, {username}!")
                return cls(user_id, username, email, password_hash)
            else:
                print("Login failed: Incorrect email or password.")
                return None

    def create_task(self, title, description, due_date=None):
        task = Task(self.user_id, title, description, due_date)
        task.save()
        return task


class Task:
    def __init__(self, user_id, title, description, due_date=None, task_id=None):
        self.task_id = task_id
        self.user_id = user_id
        self.title = title
        self.description = description
        self.due_date = due_date
        self.status = 'pending'

    def save(self):
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO Tasks (user_id, title, description, due_date, status) 
                VALUES (?, ?, ?, ?, 'pending')
            """, (self.user_id, self.title, self.description, self.due_date))
            conn.commit()
            self.task_id = cursor.lastrowid
            print(f"Task '{self.title}' created with ID: {self.task_id}.")

    @classmethod
    def open_task(cls, task_id):
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT task_id, user_id, title, description, due_date, status FROM Tasks WHERE task_id = ?
            """, (task_id,))
            task_data = cursor.fetchone()
            
            if task_data:
                task_id, user_id, title, description, due_date, status = task_data
                task = cls(user_id, title, description, due_date, task_id)
                task.status = status
                print(f"Task '{task.title}' (ID: {task.task_id}) opened successfully.")
                return task
            else:
                print(f"Task with ID {task_id} not found.")
                return None

class Subtask:
    def __init__(self, task_id, title, time_estimate, order_num, subtask_id=None, time_spent=0, status='pending'):
        self.subtask_id = subtask_id
        self.task_id = task_id
        self.title = title
        self.time_estimate = time_estimate
        self.time_spent = time_spent
        self.order_num = order_num
        self.status = status

    def save(self):
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO Subtasks (task_id, title, time_estimate, order_num, status) 
                VALUES (?, ?, ?, ?, 'pending')
            """, (self.task_id, self.title, self.time_estimate, self.order_num))
            conn.commit()
            self.subtask_id = cursor.lastrowid
            print(f"Subtask '{self.title}' created with ID: {self.subtask_id}.")

    @classmethod
    def open_subtask(cls, subtask_id):
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT subtask_id, task_id, title, time_estimate, time_spent, status FROM Subtasks WHERE subtask_id = ?
            """, (subtask_id,))
            subtask_data = cursor.fetchone()

            if subtask_data:
                subtask_id, task_id, title, time_estimate, time_spent, status = subtask_data
                subtask = cls(task_id, title, time_estimate, order_num=None, subtask_id=subtask_id, time_spent=time_spent, status=status)
                print(f"Subtask '{subtask.title}' (ID: {subtask.subtask_id}) opened successfully.")
                return subtask
            else:
                print(f"Subtask with ID {subtask_id} not found.")
                return None

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    user = User.register(data['username'], data['email'], data['password'])
    if user:
        return jsonify({'user_id': user.user_id, 'username': user.username}), 201
    return jsonify({'error': 'User already exists'}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.login(data['email'], data['password'])
    if user:
        return jsonify({'user_id': user.user_id, 'username': user.username}), 200
    return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.open_task(task_id)
    if task:
        return jsonify({
            'task_id': task.task_id,
            'title': task.title,
            'description': task.description,
            'due_date': task.due_date,
            'status': task.status
        }), 200
    return jsonify({'error': 'Task not found'}), 404

@app.route('/subtasks/<int:subtask_id>', methods=['GET'])
def get_subtask(subtask_id):
    subtask = Subtask.open_subtask(subtask_id)
    if subtask:
        return jsonify({
            'subtask_id': subtask.subtask_id,
            'title': subtask.title,
            'time_estimate': subtask.time_estimate,
            'status': subtask.status
        }), 200
    return jsonify({'error': 'Subtask not found'}), 404

@app.route('/tasks', methods=['GET'])
def get_tasks():
    user_id = request.args.get('user_id')
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT task_id, title, due_date, status FROM Tasks WHERE user_id = ?", (user_id,))
        tasks = cursor.fetchall()
        
    return jsonify([{
        'task_id': task[0],
        'title': task[1],
        'due_date': task[2],
        'status': task[3]
    } for task in tasks]), 200


@app.route('/subtasks', methods=['GET'])
def get_subtasks():
    task_id = request.args.get('task_id')
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT subtask_id, title, time_estimate, time_spent, status FROM Subtasks WHERE task_id = ?", (task_id,))
        subtasks = cursor.fetchall()
        
    return jsonify([{
        'subtask_id': subtask[0],
        'title': subtask[1],
        'time_estimate': subtask[2],
        'time_spent': subtask[3],
        'status': subtask[4]
    } for subtask in subtasks]), 200


@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.json
    title = data.get('title')
    description = data.get('description')
    due_date = data.get('due_date')
    user_id = data.get('user_id')
    subtasks = data.get('subtasks', [])  # Get subtasks from the request

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(""" 
            INSERT INTO Tasks (user_id, title, description, due_date, status) 
            VALUES (?, ?, ?, ?, 'pending') 
        """, (user_id, title, description, due_date))
        
        conn.commit()
        task_id = cursor.lastrowid  # Get the ID of the newly created task

        # Now add the subtasks for the created task
        for subtask in subtasks:
            cursor.execute(""" 
                INSERT INTO Subtasks (task_id, title, time_estimate, status) 
                VALUES (?, ?, ?, 'pending') 
            """, (task_id, subtask['title'], subtask['time_estimate']))
        
        conn.commit()  # Commit changes for subtasks

    return jsonify({'task_id': task_id}), 201


@app.route('/tasks/<int:task_id>/subtasks', methods=['POST'])
def add_subtasks(task_id):
    data = request.json
    subtasks = data  # List of subtasks

    with get_db_connection() as conn:
        cursor = conn.cursor()
        for subtask in subtasks:
            cursor.execute("""
                INSERT INTO Subtasks (task_id, title, time_estimate, status) 
                VALUES (?, ?, ?, 'pending')
            """, (task_id, subtask['title'], subtask['time_estimate']))
        conn.commit()
    return jsonify({'message': 'Subtasks added successfully!'}), 201

@app.route('/username', methods=['GET'])
def get_username():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT username FROM Users WHERE user_id = ?", (user_id,))
        user = cursor.fetchone()

    if user:
        return jsonify({'username': user[0]}), 200
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    title = data.get('title')
    description = data.get('description')
    due_date = data.get('due_date')
    user_id = data.get('user_id')
    subtasks = data.get('subtasks', [])

    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Update the main task details
        cursor.execute("""
            UPDATE Tasks
            SET title = ?, description = ?, due_date = ?
            WHERE task_id = ? AND user_id = ?
        """, (title, description, due_date, task_id, user_id))

        if cursor.rowcount == 0:
            return jsonify({'error': 'Task not found or does not belong to the user'}), 404

        # Fetch existing subtask IDs for the task
        cursor.execute("SELECT subtask_id FROM Subtasks WHERE task_id = ?", (task_id,))
        existing_subtask_ids = {row[0] for row in cursor.fetchall()}

        # Identify subtask IDs present in the request
        incoming_subtask_ids = {subtask.get('id') for subtask in subtasks if subtask.get('id')}

        # Subtasks to delete: those in the database but not in the incoming data
        subtask_ids_to_delete = existing_subtask_ids - incoming_subtask_ids
        if subtask_ids_to_delete:
            cursor.execute("DELETE FROM Subtasks WHERE subtask_id IN (%s)" %
                           ",".join("?" * len(subtask_ids_to_delete)), tuple(subtask_ids_to_delete))

        # Process each subtask in the incoming data
        for subtask in subtasks:
            subtask_id = subtask.get('id')
            title = subtask.get('title')
            time_estimate = subtask.get('time_estimate')

            if subtask_id and subtask_id in existing_subtask_ids:
                # Update existing subtask
                cursor.execute("""
                    UPDATE Subtasks
                    SET title = ?, time_estimate = ?
                    WHERE subtask_id = ? AND task_id = ?
                """, (title, time_estimate, subtask_id, task_id))
            elif not subtask_id:
                # Insert new subtask
                cursor.execute("""
                    INSERT INTO Subtasks (title, time_estimate, task_id)
                    VALUES (?, ?, ?)
                """, (title, time_estimate, task_id))

        conn.commit()  # Commit all changes

    return jsonify({'message': 'Task and subtasks updated successfully!'}), 200

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # First, check if the task exists
        cursor.execute("SELECT task_id FROM Tasks WHERE task_id = ?", (task_id,))
        task = cursor.fetchone()
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404

        # If the task exists, delete it and its associated subtasks
        cursor.execute("DELETE FROM Subtasks WHERE task_id = ?", (task_id,))  # Delete subtasks
        cursor.execute("DELETE FROM Tasks WHERE task_id = ?", (task_id,))  # Delete task
        
        conn.commit()
        
    return jsonify({'message': f'Task {task_id} deleted successfully!'}), 200

@app.route('/subtasks/<int:subtask_id>/status', methods=['PUT'])
def update_subtask_status(subtask_id):
    data = request.json
    new_status = data.get('status')

    if new_status not in ['completed', 'pending']:
        return jsonify({'error': 'Invalid status'}), 400

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE Subtasks
            SET status = ?
            WHERE subtask_id = ?
        """, (new_status, subtask_id))

        if cursor.rowcount == 0:
            return jsonify({'error': 'Subtask not found'}), 404

        conn.commit()

    return jsonify({'message': 'Subtask status updated successfully!'}), 200

@app.route('/tasks/<int:task_id>/log_time', methods=['POST'])
def log_time_on_task(task_id):
    data = request.json
    time_spent = data.get('time_spent', 0)
    print(time_spent)
    
    if time_spent < 0:
        return jsonify({'error': 'Time spent cannot be negative'}), 400
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(""" 
            UPDATE Tasks
            SET time_spent = time_spent + ?
            WHERE task_id = ? 
        """, (time_spent, task_id))
        conn.commit()

    return jsonify({'message': 'Time logged successfully!'}), 200

@app.route('/subtasks/<int:subtask_id>/log_time', methods=['POST'])
def log_time_on_subtask(subtask_id):
    data = request.json
    time_spent = data.get('time_spent', 0)
    print(f"Logging time for subtask ID: {subtask_id}, Time Spent: {time_spent}")

    
    if time_spent < 0:
        return jsonify({'error': 'Time spent cannot be negative'}), 400
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(""" 
                UPDATE Subtasks
                SET time_spent = time_spent + ?
                WHERE subtask_id = ? 
            """, (time_spent, subtask_id))
            conn.commit()
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({'error': 'Failed to log time for the subtask'}), 500

    return jsonify({'message': 'Time logged successfully!'}), 200

# Ensure you have 'time_spent' columns in your database tables

    
if __name__ == '__main__':
    app.run(debug=True)
