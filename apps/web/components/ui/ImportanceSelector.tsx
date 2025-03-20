import React from "react";

const ImportanceSelector: React.FC<{ value: number; onChange: (value: number) => void }> = ({
  value,
  onChange,
}) => {
  const levels = [
    { emoji: "⚪", label: "1", value: 1 },
    { emoji: "🟢", label: "2", value: 2 },
    { emoji: "🟢", label: "3", value: 3 },
    { emoji: "🟡", label: "4", value: 4 },
    { emoji: "🟡", label: "5", value: 5 },
    { emoji: "🟠", label: "6", value: 6 },
    { emoji: "🟠", label: "7", value: 7 },
    { emoji: "🔴", label: "8", value: 8 },
    { emoji: "🔴", label: "9", value: 9 },
    { emoji: "🔥", label: "10", value: 10 },
  ];

  return (
    <div className="mt-4">
      <label className="block text-gray-700 dark:text-gray-300">Task Importance</label>
      <div className="flex flex-wrap justify-center items-center overflow-x-auto gap-x-0.5 sm:gap-x-2 min-w-0">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission
              onChange(level.value);
            }}
            type="button"
            className={`text-base sm:text-xl scale-55 sm:scale-100 p-0.5 sm:p-1 rounded transition-transform ${
              value === level.value ? "ring-2 ring-black dark:ring-white" : ""
            }`}
            title={`Importance: ${level.label}`}
          >
            {level.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImportanceSelector;
