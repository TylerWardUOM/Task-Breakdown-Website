"use client";
import { useState } from "react";
import { resendVerificationEmail, signInWithEmailPassword, signInWithGoogle } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../../lib/firebase";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const router = useRouter();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  
  const handleRegisterRedirect = () => {
    router.push("/register");
  };

  const handlePasswordResetRedirect = () =>{
    router.push("/resetPassword")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset errors

    try {
      const result = await signInWithEmailPassword(email, password);

      // ✅ Check if the API returned an error response
      if (result.errorCode) {
        console.error("API Error:", result.errorCode, result.errorMessage);

        // Handle specific Firebase authentication errors from API response
        switch (result.errorCode) {
          case "auth/user-not-found":
            setError("No account found with this email. Please check your email or sign up.");
            break;
          case "auth/wrong-password":
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
            setError(result.errorMessage || "Login failed. Please try again.");
        }
        return; // Exit function if there was an error
      }

      // ✅ Check if email is not verified
      if (result.emailVerified === false) {
        setError("Please verify your email before logging in.");
        setEmailVerified(false);
        return;
      }

      // ✅ If login is successful, redirect to dashboard
      router.push("/user/dashboard");
    } catch (error: unknown) {
      console.error("Unexpected Login Error:", error);

      if (error instanceof FirebaseError) {
        setError(error.message || "Login failed. Please try again.");
      } else if (error instanceof Error) {
        setError(error.message || "An unexpected error occurred. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);      
      const userCredential = await signInWithPopup(auth, provider);
  
      if (!userCredential) {
        throw new Error("Google sign-in failed. No user credential returned.");
      }
  
      // Call function to handle Google authentication & send tokens to the backend
      const response = await signInWithGoogle(userCredential);
  
      // ✅ Check if the API returned an error response
      if (response.errorCode) {
        console.error("API Error:", response.errorCode, response.errorMessage);
  
        // Handle specific Firebase authentication errors from API response
        switch (response.errorCode) {
          case "auth/user-not-found":
            setError("No account found with this email. Please sign up first.");
            break;
          case "auth/wrong-password":
          case "auth/invalid-credential":
            setError("Incorrect password. Please try again.");
            break;
          case "auth/invalid-email":
            setError("Invalid email format. Please enter a valid email.");
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
            setError(response.errorMessage || "Login failed. Please try again.");
        }
        return; // Exit function if there was an error
      }
  
      // ✅ Check if email is not verified
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in.");
        setEmailVerified(false);
        return;
      }
  
      // ✅ If login is successful, redirect to dashboard
      router.push("/user/dashboard");
    } catch (error: unknown) {
      console.error("Unexpected Login Error:", error);
  
      if (error instanceof FirebaseError) {
        setError(error.message || "Login failed. Please try again.");
      } else if (error instanceof Error) {
        setError(error.message || "An unexpected error occurred. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  
  const handleResendVerificationEmail = async () => {
    try {
      const response = await resendVerificationEmail(email, password);
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
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
          Forgot Password?{" "}
          <button onClick={handlePasswordResetRedirect} className="text-blue-600 hover:underline">
            Reset Password
          </button>
        </p>

        <p className="text-sm text-center mt-4">
          Don&apos;t have an account?{" "}
          <button onClick={handleRegisterRedirect} className="text-blue-600 hover:underline">
            Register
          </button>
        </p>
        {!emailVerified && (
          <div className="text-center mt-4">
            <p className="text-sm">Didn&apos;t receive the verification email?</p>
            <button onClick={handleResendVerificationEmail} className="text-blue-600 hover:underline">
              Resend Verification Email
            </button>
          </div>
        )}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleGoogleSignIn}
            aria-label="Sign in with Google"
            className="w-max-full bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 transition duration-300 shadow-md"
          >
            <Image
              src="/web_light_sq_SI.svg"
              alt="Sign in with Google"
              width={300} // Adjust width to match button
              height={50} // Adjust height to match button
              className="h-10 w-auto" 
            />
          </button>
        </div>
      </div>
    </div>
  );
}
