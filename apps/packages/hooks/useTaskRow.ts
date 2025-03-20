import { useState } from "react";


export const useTaskRow = () => {

    const [expanded, setExpanded] = useState<boolean>(false);
    const toggleTask = () => {
        setExpanded((prev) => {
        if (prev===true) {
        return false;
        } else {
        return true;
        }
    });
    };

    return{
        expanded,
        toggleTask
    };
};