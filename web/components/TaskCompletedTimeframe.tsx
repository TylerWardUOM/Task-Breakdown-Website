import React, { useEffect, useState } from 'react';
import Card from './ui/Card';
interface TaskStatProps {
  timeframe: string; // The timeframe (week, month, etc.)
  title: string; // The title of the card (for display)
  firebaseToken: string | null;  // The Firebase token passed as a prop
}

const TaskCompletedTimeframe: React.FC<TaskStatProps> = ({ timeframe, title, firebaseToken}) => {
  // State to store the completed task count
  const [completedTasks, setCompletedTasks] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch completed tasks for a specific timeframe
  const fetchCompletedTasks = async (timeframe: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/completed/${timeframe}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Handle token expiry and redirect to login
          console.error('Unauthorized. Please login again.');
        } else {
          throw new Error('Failed to fetch completed tasks');
        }
      }

      const data = await response.json();
      setCompletedTasks(Number(data.completedTasks)); // Assuming response is like { completedTasks: 10 }
    } catch (err) {
      console.error(err);
      setError('Failed to load completed tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch completed tasks for the selected timeframe when component mounts or when timeframe changes
  useEffect(() => {
    fetchCompletedTasks(timeframe);
  }, [timeframe]);

  return (
    <Card title={title}>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center">{error}</p>
      ) : (
        <p className="text-center">{completedTasks}</p>
      )}
    </Card>
  );
};  

export default TaskCompletedTimeframe;
