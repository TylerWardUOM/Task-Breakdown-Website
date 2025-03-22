import { forwardRef, useImperativeHandle } from "react";
import { Subtask } from "@GlobalTypes/Task";
import { TaskBreakdownResponse } from "@FrontendTypes/AiResponse";
import useSubtasks from "@Hooks/useSubtasks";
import SubtaskModalList from "./SubtaskModalList";


// ✅ SubtaskModal Component
interface SubtaskModalProps {
  existing_subtasks?: Subtask[] | null;
  response?: TaskBreakdownResponse | null;
}

const SubtaskModal = forwardRef(({ existing_subtasks, response }: SubtaskModalProps, ref) => {
  const {
    getSubtasks,
    orderedSubtasks,
    unorderedSubtasks,
    updateSubtaskField,
    deleteSubtask,
    addSubtask,
    moveSubtaskBetweenSections,
    changeSubtaskOrder,
    findMaxOrder,
  } = useSubtasks({ existing_subtasks, response });

  // Expose function to get subtasks
  useImperativeHandle(ref, () => ({
    getSubtasks,
  }));

  return (
    <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-700 dark:border dark:border-gray-600 mt-2">
      <h4 className="font-semibold text-gray-900 dark:text-white">Subtasks</h4>
      <div className="space-y-3">

        {/* Ordered Subtasks */}
        <SubtaskModalList
          subtasks={orderedSubtasks}
          isOrdered={true}
          updateSubtaskField={updateSubtaskField}
          deleteSubtask={deleteSubtask}
          moveSubtaskBetweenSections={moveSubtaskBetweenSections}
          changeSubtaskOrder={changeSubtaskOrder}
        />

        <button
          onClick={() => addSubtask(findMaxOrder())}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Subtask to Ordered
        </button>

        {/* Unordered Subtasks */}
        <SubtaskModalList
          subtasks={unorderedSubtasks}
          isOrdered={false}
          updateSubtaskField={updateSubtaskField}
          deleteSubtask={deleteSubtask}
          moveSubtaskBetweenSections={moveSubtaskBetweenSections}
          changeSubtaskOrder={changeSubtaskOrder}
        />

        <button
          onClick={() => addSubtask(null)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Subtask to Unordered
        </button>

      </div>
    </div>
  );
});

SubtaskModal.displayName = "SubtaskModal";
export default SubtaskModal;