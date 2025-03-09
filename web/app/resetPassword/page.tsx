"use client";

import { useState } from "react";
import { sendPasswordReset } from "../../lib/auth"; // Assuming you have this function in your auth.js file
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false); // To control showing the success message
  const [loading, setLoading] = useState(false); // To show loading state while request is in progress
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true); // Set loading to true when request is sent

    try {
      await sendPasswordReset(email); // Send password reset email
      setResetEmailSent(true); // Set success flag
      setError(null); // Clear any previous errors

      // After 3 seconds, redirect to login page
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message); // Display any errors that occurred
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">Reset Password</h2>
        
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        
        {resetEmailSent && (
          <div className="bg-green-100 p-4 rounded-md text-green-600 text-center mb-4">
            <p>Password reset email has been sent! You will be redirected to the login page shortly.</p>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md mt-4 hover:bg-blue-700 transition duration-300"
            disabled={loading} // Disable button while loading
          >
            {loading ? "Sending..." : "Send Reset Request"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Remember your password?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}