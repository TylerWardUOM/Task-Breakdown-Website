"use client";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: string; // Optional width prop (default can be set to a value)
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, width = "max-w-2xl" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      {/* Use the passed width or default to 'max-w-2xl' */}
      <div className={`bg-white rounded-lg shadow-lg ${width} w-full p-6 relative`}>
        <button className="absolute top-3 right-3 text-xl" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
