import { useEffect } from "react";
import Card from "../ui/Card";

interface TaskStatProps {
  timeframe: string;
  title: string;
  completedTasks: number | null;
  loadingCompletedTasks: boolean;
  completedTasksError: string | null;
  fetchCompletedTasksByTimeframe: (timeframe: string) => void;
}

const TaskCompletedTimeframe: React.FC<TaskStatProps> = ({
  timeframe,
  title,
  completedTasks,
  loadingCompletedTasks,
  completedTasksError,
  fetchCompletedTasksByTimeframe
}) => {
  // Fetch data when component mounts or timeframe changes
  useEffect(() => {
    fetchCompletedTasksByTimeframe(timeframe);
  }, [timeframe, fetchCompletedTasksByTimeframe]);

  return (
    <Card title={title}>
      {loadingCompletedTasks ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : completedTasksError ? (
        <p className="text-center text-red-500">Error: {completedTasksError}</p>
      ) : completedTasks !== null ? (
        <p className="text-center font-semibold">{completedTasks}</p>
      ) : (
        <p className="text-center text-gray-400">No data available</p>
      )}
    </Card>
  );
};

export default TaskCompletedTimeframe;
