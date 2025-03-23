"use client";
import Image from "next/image";
import { useAuthLogin } from "hooks/useAuthLogin";

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    success,
    loading,
    emailVerified,
    signInWithEmail,
    signInWithGoogle,
    handleResendVerificationEmail,
    handleRegisterRedirect,
    handlePasswordResetRedirect,
  } = useAuthLogin();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithEmail(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}
        <form onSubmit={handleEmailLogin} className="space-y-4">
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
            onClick={signInWithGoogle}
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
};