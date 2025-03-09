"use client";
import { ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-white shadow-md rounded p-4 flex flex-col items-center justify-center">
      <h3 className="text-lg font-bold mb-2 text-center">{title}</h3>
      <div className="w-full">{children}</div>
    </div>
  );
};


export default Card;