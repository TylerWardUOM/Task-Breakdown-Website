import { EyeIcon } from "@heroicons/react/solid";
import { getSizeClasses } from "lib/ButtonStyles";

interface FocusModeButtonProps {
  onFocus: () => void;
  size?: "sm" | "md" | "lg";
}

const FocusModeButton: React.FC<FocusModeButtonProps> = ({ onFocus, size = "md" }) => {
  const { button, icon } = getSizeClasses(size);

  return (
    <button
      onClick={onFocus}
      className={`relative flex items-center justify-center bg-purple-500 text-white rounded transition hover:bg-purple-600 group ${button}`}
      type="button"
      aria-label="Go to Focus Mode"
    >
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        Focus Mode
      </span>

      <EyeIcon className={icon} />
    </button>
  );
};

export default FocusModeButton;
