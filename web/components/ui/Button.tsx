"use client";

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = "primary" }) => {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-semibold transition 
        ${variant === "primary" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-black hover:bg-gray-400"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
