// app/page.tsx
import TaskForm from "../../../components/ui/TaskModalAi";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <TaskForm />
    </main>
  );
}
