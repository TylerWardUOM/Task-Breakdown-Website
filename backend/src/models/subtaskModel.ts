import pool from "../config/db"; // Assuming you are using a PostgreSQL pool

// Create a new subtask in the database
export const createSubtaskInDB = async (
    task_id: number,
    title: string,
    description: string | null,
    duration: number | null,
    importance_factor: number | null,
    order: number | null
) => {
    const query = `
        INSERT INTO subtasks (task_id, title, description, duration, importance_factor, "order")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const values = [task_id, title, description, duration, importance_factor, order];
    return pool.query(query, values);
};

// Get all subtasks for a specific task
export const getSubtasksFromDB = async (task_id: number) => {
    const query = 'SELECT * FROM subtasks WHERE task_id = $1 AND is_deleted = FALSE ORDER BY "order" NULLS LAST, created_at DESC;';
    return pool.query(query, [task_id]);
};

// Get a single subtask by ID
export const getSubtaskByIdFromDB = async (subtask_id: number) => {
    const query = 'SELECT * FROM subtasks WHERE id = $1 ';
    return pool.query(query, [subtask_id]);
};

// Update a subtask
export const updateSubtaskInDB = async (
    subtask_id: number,
    title?: string,
    description?: string | null,
    duration?: number | null,
    importance_factor?: number | null,
    order?: number | null,
    is_deleted?: boolean | null,
) => {
    const query = `
        UPDATE subtasks
        SET title = COALESCE($2, title),
            description = COALESCE($3, description),
            duration = COALESCE($4, duration),
            importance_factor = COALESCE($5, importance_factor),
            "order" = $6,
            is_deleted = COALESCE($7, is_deleted),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;
    const values = [subtask_id, title, description, duration, importance_factor, order, is_deleted];
    return pool.query(query, values);
};

// Mark a subtask as completed
export const completeSubtaskInDB = async (subtask_id: number) => {
    const query = `
        UPDATE subtasks
        SET completed = TRUE, completed_at = NOW(), updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;
    return pool.query(query, [subtask_id]);
};

// Mark a subtask as uncompleted
export const uncompleteSubtaskFromDB = async (subtask_id: number) => {
    const query = `
        UPDATE subtasks
        SET completed = false, completed_at = NULL, updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;
    return pool.query(query, [subtask_id]);
};

// Soft delete a subtask (set is_deleted = TRUE)
export const deleteSubtaskInDB = async (subtask_id: number) => {
    const query = `
        UPDATE subtasks
        SET is_deleted = TRUE, updated_at = NOW() -- Soft delete instead of actual deletion
        WHERE id = $1
        RETURNING *;
    `;
    return pool.query(query, [subtask_id]);
};