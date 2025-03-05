import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SubtaskListProps {
  subtasks: any[];
  onRemoveSubtask: (id: number) => void;
  setSubtasks: (updatedSubtasks: any[]) => void;
}

const SubtaskList: React.FC<SubtaskListProps> = ({ subtasks, onRemoveSubtask, setSubtasks }) => {
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const oldIndex = subtasks.findIndex((subtask) => subtask.id === active.id);
    const newIndex = subtasks.findIndex((subtask) => subtask.id === over.id);

    if (oldIndex !== newIndex) {
      setSubtasks(arrayMove(subtasks, oldIndex, newIndex));
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={subtasks.map((subtask) => subtask.id)}>
        <div>
          {subtasks.map((subtask) => (
            <DraggableItem key={subtask.id} subtask={subtask} onRemove={onRemoveSubtask} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

interface DraggableItemProps {
  subtask: any;
  onRemove: (id: number) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ subtask, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: subtask.id });

const style = {
  // Apply only the transform properties you need
  transform: `translateY(${transform?.y || 0}px)`, // Apply only vertical translation
  transition,
};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 mb-2 border rounded flex justify-between items-center cursor-move bg-white"
    >
      <div>
        <strong>{subtask.title}</strong>
        <p>Duration: {subtask.duration} min</p>
        <p>Importance: {subtask.importance}</p>
        {subtask.dependency && <p>Depends on: {subtask.dependency}</p>}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onRemove(subtask.id); }} className="text-red-500">
        Delete
      </button>
    </div>
  );
};

export default SubtaskList;
