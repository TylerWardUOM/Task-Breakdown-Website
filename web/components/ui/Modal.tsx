"use client";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: string; // Optional width prop (default can be set to a value)
  maxHeight?: string; // Optional max height prop
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  width = "max-w-2xl", 
  maxHeight = "max-h-[80vh]" // Default max height
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className={`bg-white rounded-lg shadow-lg ${width} w-full p-6 relative dark:bg-gray-700 overflow-y-auto ${maxHeight} custom-scrollbar`}
      >
        <button className="absolute top-3 right-3 text-xl" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
