import pool from "../config/db"; // Assuming you are using a PostgreSQL pool

// Create a new task in the database
export const createTaskInDB = async (
    user_id: number,
    title: string,
    description: string | null,
    due_date: Date | null,
    importance_factor: number | null,
    duration: number | null, // Duration in minutes
    repeat_interval: string | null,
    category_id: number | null,
    notes: string | null
) => {
    const query = `
        INSERT INTO tasks (
            user_id, title, description, due_date, importance_factor,
            duration, repeat_interval, category_id, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
    `;
    const values = [user_id, title, description, due_date, importance_factor, duration, repeat_interval, category_id, notes];
    return pool.query(query, values);
};

// Get all tasks for a specific user from the database
export const getTasksFromDB = async (user_id: number) => {
    const query = 'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC';
    return pool.query(query, [user_id]);
};

// Get a single task by ID
export const getTaskByIdFromDB = async (user_id: number, taskId: number) => {
    const query = 'SELECT * FROM tasks WHERE user_id = $1 AND id = $2';
    const result = await pool.query(query, [user_id, taskId]);
    return result.rows[0];
};

// Update an existing task in the database
export const updateTaskInDB = async (
    taskId: number,
    title: string | null,
    description: string | null,
    due_date: Date | null,
    importance_factor: number | null,
    duration: number | null, // Duration in minutes
    repeat_interval: string | null,
    category_id: number | null,
    notes: string | null,
    completed: boolean | null,
    completed_at: Date | null
) => {
    const query = `
        UPDATE tasks SET
            title = COALESCE($2, title),
            description = COALESCE($3, description),
            due_date = COALESCE($4, due_date),
            importance_factor = COALESCE($5, importance_factor),
            duration = COALESCE($6, duration),
            repeat_interval = COALESCE($7, repeat_interval),
            category_id = COALESCE($8, category_id),
            notes = COALESCE($9, notes),
            completed = COALESCE($10, completed),
            completed_at = COALESCE($11, completed_at),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;
    const values = [taskId, title, description, due_date, importance_factor, duration, repeat_interval, category_id, notes, completed, completed_at];
    return pool.query(query, values);
};


export const updateTaskWithNullsDB = async (
    taskId: number,
    title: string | null,
    description: string | null,
    due_date: Date | null,
    importance_factor: number | null,
    duration: number | null, // Duration in minutes
    repeat_interval: string | null,
    category_id: number | null,
    notes: string | null,
    completed: boolean | null,
    completed_at: Date | null
) => {
    const query = `
        UPDATE tasks SET
            title = $2,  -- Allow null to reset title
            description = $3,  -- Allow null to reset description
            due_date = $4,  -- Allow null to reset due date
            importance_factor = $5,  -- Allow null to reset importance factor
            duration = $6,  -- Allow null to reset duration
            repeat_interval = $7,  -- Allow null to reset repeat interval
            category_id = $8,  -- Allow null to reset category
            notes = $9,  -- Allow null to reset notes
            completed = $10,  -- Allow null to reset completed
            completed_at = $11,  -- Allow null to reset completed_at
            updated_at = NOW()  -- Timestamp of update
        WHERE id = $1
        RETURNING *;
    `;
    const values = [taskId, title, description, due_date, importance_factor, duration, repeat_interval, category_id, notes, completed, completed_at];
    return pool.query(query, values);
};

// Delete a task from the database
export const deleteTaskFromDB = async (taskId: number) => {
    const query = 'DELETE FROM tasks WHERE id = $1';
    return pool.query(query, [taskId]);
};

// Add a note to a task
export const addNoteToTaskInDB = async (taskId: number, note: string) => {
    const query = 'UPDATE tasks SET notes = CONCAT(notes, $2) WHERE id = $1 RETURNING *;';
    return pool.query(query, [taskId, '\n' + note]);
};

// Get tasks with filtering options
export const getFilteredTasksFromDB = async (user_id: number, category_id?: string, due_date?: string, importance_factor?: string) => {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    let values = [user_id];
    let conditions = [];

    if (category_id) {
        conditions.push('category_id = $' + (values.length + 1));
        values.push(parseInt(category_id, 10));
    }

    if (due_date) {
        const dateObj = new Date(due_date);
        if (!isNaN(dateObj.getTime())) {
            conditions.push('due_date = $' + (values.length + 1));
            values.push(parseInt(dateObj.toISOString()));
        } else {
            throw new Error("Invalid date format");
        }
    }

    if (importance_factor) {
        conditions.push('importance_factor = $' + (values.length + 1));
        values.push(parseInt(importance_factor, 10));
    }

    if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';
    return pool.query(query, values);
};

// Create a repeated task in the database
export const createRepeatedTaskInDB = async (
    user_id: number,
    taskId: number,
    nextDueDate: Date
) => {
    const task = await getTaskByIdFromDB(user_id, taskId);
    if (!task) {
        return null;
    }

    const query = `
        INSERT INTO tasks (
            user_id, title, description, due_date, importance_factor,
            duration, repeat_interval, category_id, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
    `;
    const values = [
        task.user_id,
        task.title,
        task.description,
        nextDueDate,
        task.importance_factor,
        task.duration,
        task.repeat_interval,
        task.category_id,
        task.notes
    ];

    return pool.query(query, values);
};

// Get tasks with pagination
export const getTasksWithPaginationFromDB = async (user_id: number, page: number, limit: number) => {
    const offset = (page - 1) * limit;
    const query = 'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    return pool.query(query, [user_id, limit, offset]);
};

// Utility function to calculate the next due date for repeated tasks
export const calculateNextDueDate = (due_date: Date, repeat_interval: string) => {
    const interval = repeat_interval.toLowerCase();
    const nextDueDate = new Date(due_date);

    if (interval.includes('day')) {
        nextDueDate.setDate(nextDueDate.getDate() + 1);
    } else if (interval.includes('week')) {
        nextDueDate.setDate(nextDueDate.getDate() + 7);
    } else if (interval.includes('month')) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }

    return nextDueDate;
};
