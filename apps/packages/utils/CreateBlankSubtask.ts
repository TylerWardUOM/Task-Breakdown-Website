import {Subtask_data } from "@GlobalTypes/Task";
import { v4 as uuidv4 } from 'uuid';
import { LocalSubtask } from "@FrontendTypes/LocalSubtask";

export const CreateBlankSubtask = (prevOrder: number | null) => {
    
    const subtask: Subtask_data = {
        subtaskId: undefined,
        title: "",
        description: null,
        duration: null,
        importance_factor: 5,
        is_deleted: undefined,
        order: null,
    }

    if (prevOrder!=null){
        subtask.order = prevOrder+1;
    }

    const NewLocalSubtask: LocalSubtask = {uuid: uuidv4(), subtask: subtask, temp_order: subtask.order};
    return NewLocalSubtask;

}