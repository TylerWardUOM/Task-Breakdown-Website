"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmailPassword, signUpWithGoogle } from "../../lib/auth"; // Import updated function
import { FirebaseError } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../../lib/firebase";
import Image from "next/image";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const router = useRouter();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

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
      const response = await signUpWithEmailPassword(email, password, username);
      if ("success" in response && response.success) {
        setSuccess(response.message);
        setIsRegistered(true);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        router.push("/login");
      } else if (response.errorCode) {
        handleAuthErrors(response.errorCode);
      }
    } catch (error: unknown) {
      console.error("Error during registration:", error);
      handleFirebaseErrors(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      if (userCredential) {
        const response = await signUpWithGoogle(userCredential);
        if ("success" in response && response.success) {
          setSuccess(response.message);
          setIsRegistered(true);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          router.push("/login");
        } else if (response.errorCode) {
          handleAuthErrors(response.errorCode);
        }
      } else {
        setError("Google sign-in credentials were not retrieved correctly.");
      }
    } catch (error: unknown) {
      console.error("Error during Google registration:", error);
      handleFirebaseErrors(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthErrors = (errorCode: string) => {
    const errorMessages: { [key: string]: string } = {
      "auth/email-already-in-use": "This email is already in use. Please try logging in.",
      "auth/invalid-email": "Invalid email format. Please enter a valid email address.",
      "auth/weak-password": "Weak password. Please choose a stronger password.",
      "auth/missing-password": "Please enter a password.",
      "auth/network-request-failed": "Network error. Please check your internet connection.",
      "auth/user-already-exists": "User is already registered in the database. Please try logging in.",
    };
    setError(errorMessages[errorCode] || "Registration failed. Please try again.");
  };

  const handleFirebaseErrors = (error: unknown) => {
    if (error instanceof FirebaseError) {
      setError(error.message || "Registration failed, please try again.");
    } else {
      setError("Registration failed, please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        {!isRegistered ? (
          <>
            <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                {isLoading ? "Registering..." : "Register"}
              </button>
            </form>

            <p className="text-sm text-center mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Login
              </a>
            </p>

            <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            aria-label="Sign up with Google"
            className="w-max-full bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 transition duration-300 shadow-md"
          >
            <Image
              src="/web_light_sq_SU.svg"
              alt="Sign in with Google"
              width={300} // Adjust width to match button
              height={50} // Adjust height to match button
              className="h-10 w-auto" 
            />
          </button>
        </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Registration Successful!</h2>
            <p className="text-gray-700 mb-4">
              {success.includes("Google")
                ? "You will be redirected to the login page shortly."
                : "Please verify your email address. You will be redirected to the login page shortly."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
