import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/solid";
import { getSizeClasses } from "lib/ButtonStyles";

interface ToggleCompletionButtonProps {
  isCompleted: boolean | null;
  isToggling: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
}

const ToggleCompletionButton: React.FC<ToggleCompletionButtonProps> = ({
  isCompleted,
  isToggling,
  onToggle,
  size = "md",
}) => {
  const { button, icon } = getSizeClasses(size);

  return (
    <button
      onClick={onToggle}
      className={`relative flex items-center justify-center rounded transition border-2 group ${button}
        ${isCompleted ? "bg-green-500 border-green-500 text-white hover:bg-red-500 hover:border-red-500" 
        : "border-gray-400 text-gray-500 hover:bg-green-500 hover:border-green-500 hover:text-white"}
        ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
      type="button"
      aria-label={isCompleted ? "Unmark Task as Complete" : "Mark Task as Complete"}
      disabled={isToggling}
    >
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
      </span>

      {isCompleted ? (
        <>
          <CheckCircleIcon className={`${icon} group-hover:hidden`} />
          <XCircleIcon className={`${icon} hidden group-hover:block`} />
        </>
      ) : (
        <CheckCircleIcon className={icon} />
      )}
    </button>
  );
};

export default ToggleCompletionButton;
