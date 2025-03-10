// cronJob.ts
import cron from 'node-cron';
import { findTasksToRepeat, createRepeatedTaskInDB, calculateNextDueDate } from './models/taskModel'; // Import functions from taskModel
import { deleteUnverifiedUsersFromDB } from './models/userModel';

// Cron job that runs once a day at midnight
export const scheduleCronJobs = () => {
    cron.schedule('0 0 * * *', async () => {
        await runRepeatTasks();
        await deleteUnverifiedUsersFromDB();
    });
};

// Function that runs the cron job tasks (for manual triggering too)
export const runRepeatTasks = async () => {
    try {
        // Get all tasks where repeat_next_due_date has passed and the task is marked as completed
        const tasksToRepeat = await findTasksToRepeat();
        console.log(`Found ${tasksToRepeat.length} tasks to repeat`);

        for (const task of tasksToRepeat) {
            const nextDueDate = await calculateNextDueDate(task.due_date,task.repeat_interval);
            await createRepeatedTaskInDB(task.user_id, task.id, nextDueDate);
            console.log(`Created repeated task for task ID: ${task.id}`);
        }
    } catch (error) {
        console.error('Error during cron job execution', error);
    }
};