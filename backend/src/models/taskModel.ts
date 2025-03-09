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
    const query = 'SELECT * FROM tasks WHERE user_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC';
    return pool.query(query, [user_id]);
};

// Get all deleted tasks for a specific user
export const getDeletedTasksFromDB = async (user_id: number) => {
    const query = 'SELECT * FROM tasks WHERE user_id = $1 AND is_deleted = TRUE ORDER BY created_at DESC';
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
    completed_at: Date | null,
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

    const values = [
        taskId, 
        title, 
        description, 
        due_date, 
        importance_factor, 
        duration, 
        repeat_interval, 
        category_id, 
        notes, 
        completed, 
        completed_at, 
    ];

    return pool.query(query, values);
};


// Update a task with null values allowed in specific fields
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
    completed_at: Date | null,
) => {
    const query = `
        UPDATE tasks SET
            title = $2,
            description = $3,
            due_date = $4,
            importance_factor = $5,
            duration = $6,
            repeat_interval = $7,
            category_id = $8,
            notes = $9,
            completed = $10,
            completed_at = $11,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;
    
    const values = [
        taskId, 
        title, 
        description, 
        due_date, 
        importance_factor, 
        duration, 
        repeat_interval, 
        category_id, 
        notes, 
        completed, 
        completed_at, 
    ];

    return pool.query(query, values);
};


// Soft delete a task (set is_deleted = TRUE)
export const deleteTaskFromDB = async (taskId: number) => {
    const query = 'UPDATE tasks SET is_deleted = TRUE WHERE id = $1 RETURNING *';
    return pool.query(query, [taskId]);
};

// Restore a deleted task (set is_deleted = FALSE)
export const undeleteTaskFromDB = async (taskId: number) => {
    const query = 'UPDATE tasks SET is_deleted = FALSE WHERE id = $1 RETURNING *';
    return pool.query(query, [taskId]);
};

// Add a note to a task
export const addNoteToTaskInDB = async (taskId: number, note: string) => {
    const query = 'UPDATE tasks SET notes = CONCAT(notes, $2) WHERE id = $1 RETURNING *;';
    return pool.query(query, [taskId, '\n' + note]);
};

// Uncomplete a task (set completed = FALSE and completed_at = NULL)
export const uncompleteTaskFromDB = async (taskId:number) => {
    const query = 'UPDATE tasks SET completed = FALSE, completed_at = NULL WHERE id = $1 RETURNING *';
    return pool.query(query, [taskId]);
};

// Get tasks with filtering options
export const getFilteredTasksFromDB = async (user_id: number, category_id?: string, due_date?: string, importance_factor?: string) => {
    let query = 'SELECT * FROM tasks WHERE user_id = $1 AND is_deleted = FALSE';
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

export const createRepeatedTaskInDB = async (
    user_id: number,
    taskId: number,
    nextDueDate: Date
) => {
    // Get the original task
    const task = await getTaskByIdFromDB(user_id, taskId);
    if (!task || task.repeated) {
        return null; // Task not found or already repeated
    }

    // Insert a new task with the next due date calculated
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

    const result = await pool.query(query, values);

    // Mark the original task as repeated so it won't be processed again
    await markTaskAsRepeated(taskId);

    return result.rows[0];
};



// Get tasks with pagination
export const getTasksWithPaginationFromDB = async (user_id: number, page: number, limit: number) => {
    const offset = (page - 1) * limit;
    const query = 'SELECT * FROM tasks WHERE user_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    return pool.query(query, [user_id, limit, offset]);
};


// Utility function to calculate the next due date for repeated tasks
export const calculateNextDueDate = (due_date: Date, repeat_interval: any): Date => {
    if (!repeat_interval) {
        throw new Error("Invalid repeat interval");
    }

    const nextDueDate = new Date(due_date);

    // Check if repeat_interval is a PostgresInterval (i.e., an object with time unit like 'days', 'months', etc.)
    if (repeat_interval instanceof Object && repeat_interval.days) {
        nextDueDate.setDate(nextDueDate.getDate() + repeat_interval.days);
    } else if (repeat_interval instanceof Object && repeat_interval.months) {
        nextDueDate.setMonth(nextDueDate.getMonth() + repeat_interval.months);
    } else {
        throw new Error(`Unsupported repeat interval: ${repeat_interval}`);
    }

    return nextDueDate;
};




// Update a task to mark it as repeated after creating the repeated task
export const markTaskAsRepeated = async (taskId: number) => {
    const query = `
        UPDATE tasks SET
            repeated = TRUE
        WHERE id = $1
        RETURNING *;
    `;
    return pool.query(query, [taskId]);
};


// Find tasks to repeat (i.e., tasks whose repeat_next_due_date has passed)
export const findTasksToRepeat = async (): Promise<any[]> => {
    const currentDate = new Date();
    const query = `
        SELECT * FROM tasks
        WHERE due_date <= $1
          AND repeat_interval IS NOT NULL
          AND repeated = FALSE
    `;
    const result = await pool.query(query, [currentDate]);
    return result.rows;
};

// Get count of completed tasks (including deleted ones)
export const getCompletedTasksCount = async (user_id: number) => {
    const query = 'SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND completed_at IS NOT NULL';
    const result = await pool.query(query, [user_id]);
    return result.rows[0].count;
};

// Get count of tasks completed in different timeframes (including deleted ones)
export const getTasksCompletedInTimeframe = async (user_id: number, interval: string) => {
    const query = `
        SELECT COUNT(*) FROM tasks 
        WHERE user_id = $1 
        AND completed_at BETWEEN NOW() - INTERVAL '${interval}' AND NOW()
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows[0].count;
};

export const getTasksCompletedThisWeek = (user_id:number) => getTasksCompletedInTimeframe(user_id, '1 WEEK');
export const getTasksCompletedThisMonth = (user_id:number) => getTasksCompletedInTimeframe(user_id, '1 MONTH');
export const getTasksCompletedLast30Days = (user_id:number) => getTasksCompletedInTimeframe(user_id, '30 DAYS');
export const getTasksCompletedThisYear = (user_id:number) => getTasksCompletedInTimeframe(user_id, '1 YEAR');
export const getTasksCompletedLast365Days = (user_id:number) => getTasksCompletedInTimeframe(user_id, '365 DAYS');