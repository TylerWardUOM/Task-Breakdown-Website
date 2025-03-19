import { v4 as uuidv4 } from 'uuid';
import { Subtask, Subtask_data } from "@GlobalTypes/Task";
import { TaskBreakdownResponse } from "../web/types/Task";

/**
 * Convert AI duration to minutes.
 */
export const convertToMinutes = (duration: { hours: number; minutes: number } | null): number | null =>
    duration ? duration.hours * 60 + duration.minutes : null;

/**
 * Transform API response subtasks into local subtasks with unique UUIDs.
 */
export const mapResponseSubtasks = (response: TaskBreakdownResponse | null) => {
    if (!response || !response.subtasks) return [];
    return response.subtasks.map((subtask) => ({
        uuid: uuidv4(),
        subtask: {
            subtaskId: undefined,
            title: subtask.title,
            description: subtask.description,
            duration: convertToMinutes(subtask.duration),
            importance_factor: subtask.importance_factor,
            order: subtask.order ?? null,
            is_deleted: undefined,
        },
    }));
};

/**
 * Transform existing subtasks into local subtasks with unique UUIDs.
 */
export const mapExistingSubtasks = (existing_subtasks: Subtask[] | [] = []) => {
    return existing_subtasks.map((subtask) => ({
        uuid: uuidv4(),
        subtask: {
            subtaskId: subtask.id,
            title: subtask.title,
            description: subtask.description,
            duration: subtask.duration,
            importance_factor: subtask.importance_factor,
            order: subtask.order ?? null,
            is_deleted: subtask.is_deleted ?? undefined,
        },
    }));
};

