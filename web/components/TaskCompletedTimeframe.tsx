import React, { useEffect, useState,useCallback} from 'react';
import Card from './ui/Card';

interface TaskStatProps {
  timeframe: string; // The timeframe (week, month, etc.)
  title: string; // The title of the card (for display)
  firebaseToken: string | null;  // The Firebase token passed as a prop
}

const TaskCompletedTimeframe: React.FC<TaskStatProps> = ({ timeframe, title, firebaseToken }) => {
    // State to store the completed task count
    const [completedTasks, setCompletedTasks] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    // Memoize the function using useCallback so it doesn't change on each render
    const fetchCompletedTasks = useCallback(async (timeframe: string, firebaseToken: string | null) => {
      if (!firebaseToken) {
        setError('No Firebase token found. Please log in.');
        setLoading(false);
        return;
      }
  
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
            setError('Unauthorized. Please login again.');
          } else {
            throw new Error('Failed to fetch completed tasks');
          }
        }
  
        const data = await response.json();
        const completedCount = Number(data.completedTasks);
        // Only set the completedTasks state if the value is a valid number
        if (!isNaN(completedCount)) {
          setCompletedTasks(completedCount);
        } else {
          setError('Invalid data received for completed tasks');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load completed tasks');
      } finally {
        setLoading(false);
      }
    }, []);

  // Fetch completed tasks for the selected timeframe when component mounts or when timeframe changes
  useEffect(() => {
    setLoading(true);  // Set loading to true before the fetch starts
    setError(null);    // Reset any previous errors
    fetchCompletedTasks(timeframe, firebaseToken);
  }, [timeframe, firebaseToken,fetchCompletedTasks]);

  return (
    <Card title={title}>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center">{error}</p>
      ) : (
        // Ensure `completedTasks` is a valid number before rendering
        <p className="text-center">{completedTasks !== null ? completedTasks : 'No data available'}</p>
      )}
    </Card>
  );
};

export default TaskCompletedTimeframe;
