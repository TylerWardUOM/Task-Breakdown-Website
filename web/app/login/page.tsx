"use client";

import { useState } from "react";
import { resendVerificationEmail, signInEmailVerification } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/authContext";
import { FirebaseError } from "firebase/app";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const { setIsSigningUp } = useAuth();
  const router = useRouter();

  const handleRegisterRedirect = () => {
    router.push('/register');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Reset errors

    try {
      const result = await signInEmailVerification(email, password, setIsSigningUp);
      if (result.emailVerified === false) {
        // If email is not verified, show error and the resend option
        setError("Please verify your email before logging in.");
        setEmailVerified(false);
      } else {
        // If email is verified, redirect to dashboard
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.error("Error during Login:", error);

      if (error instanceof FirebaseError) {
        // Handle specific Firebase authentication errors
        switch (error.code) {
          case "auth/user-not-found":
            setError("No account found with this email. Please check your email or sign up.");
            break;
          case "auth/wrong-password":
            setError("Incorrect password. Please try again.");
            break;
          case "auth/invalid-credential":
            setError("Incorrect password. Please try again.");
            break;
          case "auth/invalid-email":
            setError("Invalid email format. Please enter a valid email address.");
            break;
          case "auth/too-many-requests":
            setError("Too many failed attempts. Please wait a moment and try again.");
            break;
          case "auth/user-disabled":
            setError("This account has been disabled. Please contact support.");
            break;
          case "auth/network-request-failed":
            setError("Network error. Please check your internet connection.");
            break;
          default:
            setError("Login failed. Please try again.");
        }
      } else if (error instanceof Error) {
        setError(error.message || "Login failed. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    try {
      const response = await resendVerificationEmail(email,password);
      setSuccess(response.message);
    } catch (err) {
      console.error("Error sending verification email:", err);
      setError("Failed to send verification email. Please try again later.");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
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
            className="w-full bg-blue-600 text-white p-2 rounded-md mt-4 hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

          <p className="text-sm text-center mt-4">
          Don&apos;t have an account?{' '}
          <button
            onClick={handleRegisterRedirect}
            className="text-blue-600 hover:underline"
          >
            Register
          </button>
        </p>
        {!emailVerified && (
          <div className="text-center mt-4">
            <p className="text-sm">Didn&apos;t receive the verification email?</p>
            <button
              onClick={handleResendVerificationEmail}
              className="text-blue-600 hover:underline"
            >
              Resend Verification Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}