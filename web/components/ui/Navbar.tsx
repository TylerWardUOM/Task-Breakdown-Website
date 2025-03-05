"use client";
import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  // State to track if the user is logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <nav className="flex justify-between items-center h-16 w-full bg-gray-800 text-white px-6">
      {/* Logo */}
      <Link href="/">
        <span className="text-xl font-bold cursor-pointer">MyApp</span>
      </Link>
      
      {/* Navigation Links */}
      <div className="space-x-4">
        <Link href="/features" className="hover:underline">Features</Link>
        <Link href="/pricing" className="hover:underline">Pricing</Link>
      </div>
      
      {/* Login/Logout Button */}
      <button
        onClick={() => setIsAuthenticated(!isAuthenticated)}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
      >
        {isAuthenticated ? "Logout" : "Login"}
      </button>
    </nav>
  );
};

export default Navbar;
