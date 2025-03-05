import React from "react";

const ImportanceSelector: React.FC<{ value: number; onChange: (value: number) => void }> = ({
    value,
    onChange,
  }) => {
    const levels = [
      { emoji: "🟢", label: "Very Low", value: 2 },
      { emoji: "🟡", label: "Low", value: 4 },
      { emoji: "🟠", label: "Medium", value: 6 },
      { emoji: "🔴", label: "High", value: 8 },
      { emoji: "🔥", label: "Critical", value: 10 },
    ];
  
    return (
      <div className="mt-4">
        <label className="block text-gray-700">Task Importance</label>
        <div className="flex space-x-2">
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => onChange(level.value)}
              className={`text-2xl p-2 rounded ${
                value === level.value ? "ring-2 ring-black" : ""
              }`}
            >
              {level.emoji}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  export default ImportanceSelector;
