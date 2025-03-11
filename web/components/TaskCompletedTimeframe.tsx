import Card from "./ui/Card";
import useFetchCompletedTasksTimeframe from "../hooks/useFetchCompletedTasksTimeframe";

interface TaskStatProps {
  timeframe: string; // Timeframe (week, month, etc.)
  title: string; // Card title
  firebaseToken: string | null; // Firebase token
}

const TaskCompletedTimeframe: React.FC<TaskStatProps> = ({ timeframe, title, firebaseToken }) => {
  // Fetch completed tasks using the custom hook
  const { completedTasks, loadingCompletedTasks, error } = useFetchCompletedTasksTimeframe({
    timeframe,
    firebaseToken,
  });

  return (
    <Card title={title}>
      {loadingCompletedTasks ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error: {error}</p>
      ) : completedTasks !== null ? (
        <p className="text-center font-semibold">{completedTasks}</p>
      ) : (
        <p className="text-center text-gray-400">No data available</p>
      )}
    </Card>
  );
};

export default TaskCompletedTimeframe;
