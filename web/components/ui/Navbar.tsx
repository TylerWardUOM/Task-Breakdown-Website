"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/authContext"; // Import the useAuth hook
import { logout } from "../../lib/auth"; // Import the useAuth hook

const Navbar = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  const { isAuthenticated, userName, loading } = useAuth(); // Access auth state from context
  const router = useRouter();

  const handleLogout = async () => {
    // Assuming you have a logout function in your AuthContext or lib/auth
    await logout(); // Call logout from AuthContext
    router.push("/"); // Redirect to home or login page
  };

  return (
    <nav className="flex justify-between items-center h-16 w-full bg-gray-800 text-white px-6">
      {/* Burger Button on the left */}
      <button
        onClick={onToggleSidebar}
        className="flex flex-col justify-center items-center space-y-1"  // Stack the 3 lines with space between them
        title="Toggle Sidebar"
      >
        <span className="block w-6 h-0.5 bg-white"></span>
        <span className="block w-6 h-0.5 bg-white"></span>
        <span className="block w-6 h-0.5 bg-white"></span>
      </button>

      {/* Logo */}
      <span className="text-xl font-bold cursor-pointer">MyApp</span>

      {/* Navigation Links */}
      <div className="space-x-4 hidden sm:block">
        <a href="/features" className="hover:underline">
          Features
        </a>
        <a href="/pricing" className="hover:underline">
          Pricing
        </a>
      </div>

      {/* Login/Logout and User Info */}
      <div className="flex items-center space-x-4">
        {loading ? (
          <p>Loading...</p> // Optional loading state while checking auth
        ) : isAuthenticated ? (
          <>
            {/* Display username if authenticated */}
            <span className="text-sm text-white">{userName}</span>
            <button
              onClick={handleLogout}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/register")}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
