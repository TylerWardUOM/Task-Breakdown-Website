"use client"; // Ensure it's a client-side module

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpEmailVerification } from "../../lib/auth"; // Import updated function
import { FirebaseError } from "firebase/app"; // Import FirebaseError to handle specific errors
import { useAuth } from '../../lib/authContext';


const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setIsSigningUp } = useAuth(); // Access the setIsSigningUp from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Simple client-side validation
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
      // Sign up and send email verification
      const response = await signUpEmailVerification(email, password, username, setIsSigningUp);
      setSuccess(response.message);
      
      // Redirect to login page after a few seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error: unknown) {
      console.error("Error during registration:", error);

      if (error instanceof FirebaseError) {
        // Map Firebase error codes to user-friendly messages
        switch (error.code) {
          case "auth/email-already-in-use":
            setError("This email is already in use. Please try logging in.");
            break;
          case "auth/invalid-email":
            setError("Invalid email format. Please enter a valid email address.");
            break;
          case "auth/weak-password":
            setError("Weak password. Please choose a stronger password.");
            break;
          case "auth/missing-password":
            setError("Please enter a password.");
            break;
          case "auth/network-request-failed":
            setError("Network error. Please check your internet connection.");
            break;
          default:
            setError("Registration failed. Please try again.");
        }
      } else if (error instanceof Error) {
        setError(error.message || 'Registration failed, please try again.');
      } else {
        setError('Registration failed, please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}
        
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
            disabled={isLoading}
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
