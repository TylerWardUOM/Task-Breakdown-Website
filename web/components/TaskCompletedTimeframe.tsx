import React, { useEffect, useState } from 'react';
import Card from './ui/Card';
import useFetchCompletedTasksTimeframe from '../hooks/useFetchCompletedTasksTimeframe';
import { useAuth } from '../lib/authContext';

interface TaskStatProps {
  timeframe: string; // The timeframe (week, month, etc.)
  title: string; // The title of the card (for display)
  firebaseToken: string | null;  // The Firebase token passed as a prop
}

const TaskCompletedTimeframe: React.FC<TaskStatProps> = ({ timeframe, title, firebaseToken }) => {
  const [error, setError] = useState<string | null>(null);
  const {redirectToLogin} = useAuth()
  // Use the custom hook to fetch completed tasks
  const { completedTasks, loading, error: fetchError } = useFetchCompletedTasksTimeframe({
    timeframe,
    firebaseToken,
  });

  useEffect(() => {
    if (fetchError === 'Unauthorized. Please login again.') {
      setError(fetchError);
      redirectToLogin();
    } else if (fetchError) {
      setError('Failed to load completed tasks');
    }
  }, [fetchError,redirectToLogin]);

  return (
    <Card title={title}>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error || fetchError ? (
        <p className="text-center">{error || fetchError}</p>
      ) : (
        <p className="text-center">{completedTasks !== null ? completedTasks : 'No data available'}</p>
      )}
    </Card>
  );
};

export default TaskCompletedTimeframe;
