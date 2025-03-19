"use client";
import TaskForm from "../../../components/ui/TaskModalAi";
import useFetchCategories from "../../../../packages/hooks/useFetchCategories";
import Modal from "../../../components/ui/Modal";
import { useState } from "react";
import useSubtasksByTaskIds from "../../../../packages/hooks/useSubtasksByTaskIds";
import useFetchTasks from "../../../../packages/hooks/useFetchTasks";

export default function Home() {
  const { categories } = useFetchCategories();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(true);
  const { tasks} = useFetchTasks();
  const {subtasks} = useSubtasksByTaskIds(tasks)

  console.log(subtasks);
  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} width="max-w-lg">
      <TaskForm 
        categories={categories} 
        onSave={(task) => alert(`Task Saved: ${JSON.stringify(task, null, 2)}`)} 
        onClose={closeTaskModal} 
      />
      </Modal>
    </main>
  );
}
