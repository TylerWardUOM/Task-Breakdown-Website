import useFetchCompletedTasksTimeframe from "@Hooks/useFetchCompletedTasksTimeframe";
import Card from "../ui/Card";

interface TaskStatProps {
  timeframe: string; // Timeframe (week, month, etc.)
  title: string; // Card title
}

const TaskCompletedTimeframe: React.FC<TaskStatProps> = ({ timeframe, title}) => {
  // Fetch completed tasks using the custom hook
  const { completedTasks, loadingCompletedTasks, error } = useFetchCompletedTasksTimeframe({
    timeframe,
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
