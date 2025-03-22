import { PencilIcon } from "@heroicons/react/solid";
import { getSizeClasses } from "lib/ButtonStyles";

interface EditTaskButtonProps {
  onEdit: () => void;
  size?: "sm" | "md" | "lg";
}

const EditTaskButton: React.FC<EditTaskButtonProps> = ({ onEdit, size = "md" }) => {
  const { button, icon } = getSizeClasses(size);

  return (
    <button
      onClick={onEdit}
      className={`relative flex items-center justify-center bg-yellow-500 text-white rounded transition hover:bg-yellow-600 group ${button}`}
      type="button"
      aria-label="Edit Task"
    >
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        Edit Task
      </span>

      <PencilIcon className={icon} />
    </button>
  );
};

export default EditTaskButton;
