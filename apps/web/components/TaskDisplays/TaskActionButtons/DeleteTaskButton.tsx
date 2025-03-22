import { TrashIcon } from "@heroicons/react/solid";
import { getSizeClasses } from "lib/ButtonStyles";

interface DeleteTaskButtonProps {
  onDelete: () => void;
  isDeleting: boolean;
  size?: "sm" | "md" | "lg";
}

const DeleteTaskButton: React.FC<DeleteTaskButtonProps> = ({ onDelete, isDeleting, size = "md" }) => {
  const { button, icon } = getSizeClasses(size);

  return (
    <button
      onClick={onDelete}
      className={`relative flex items-center justify-center bg-red-500 text-white rounded transition hover:bg-red-600 group ${button}
      ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
      type="button"
      aria-label="Delete Task"
      disabled={isDeleting}
    >
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        Delete Task
      </span>

      <TrashIcon className={icon} />
    </button>
  );
};

export default DeleteTaskButton;
