"use client";
import { ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-white shadow-md rounded p-4">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      {children}
    </div>
  );
};

export default Card;