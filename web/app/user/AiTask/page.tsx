"use client";
import TaskForm from "../../../components/ui/TaskModalAi";
import useFetchCategories from "../../../hooks/useFetchCategories";

export default function Home() {
  const { categories } = useFetchCategories();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <TaskForm 
        categories={categories} 
        onSave={(task) => alert(`Task Saved: ${JSON.stringify(task, null, 2)}`)} 
        onClose={() => alert("Task Form Closed")} 
      />
    </main>
  );
}
