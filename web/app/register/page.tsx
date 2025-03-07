"use client"; // Ensure it's a client-side module

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, getFirebaseToken } from "../../lib/auth"; // Import your Firebase signUp function

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // New state for username
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Set loading to true when submitting

    // Simple client-side validation for email, password, and username
    if (!email || !password || !username) {
      setError("Email, password, and username are required.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    try {
      // Call the Firebase signUp function
      const user = await signUp(email, password);
      console.log("User registered:", user); // Optionally log the user info

      // Get the Firebase ID token
      const token = await getFirebaseToken();

      if (token) {
        // Send the token, email, and username to the backend to register the user in the database
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, username, email }), // Include username and email
        });

        const data = await response.json();

        if (response.ok) {
          console.log("User registered in the database:", data);
          router.push('/login'); // Redirect to login page after successful registration
        } else {
          setError(data.error || 'Registration failed, please try again.');
        }
      }
    } catch (error: any) {
      console.error("Error during registration:", error);
      setError(error.message || 'Registration failed, please try again.');
    } finally {
      setIsLoading(false); // Reset loading state once the request is done
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md mt-4 hover:bg-blue-700 transition duration-300"
            disabled={isLoading} // Disable the button when loading
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
