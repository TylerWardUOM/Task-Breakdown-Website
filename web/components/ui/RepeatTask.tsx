import React from "react";

interface RepeatTaskProps {
  isChecked: boolean;
  onToggleRepeat: () => void;
}

const RepeatTask: React.FC<RepeatTaskProps> = ({ isChecked, onToggleRepeat }) => {
  return (
    <div>
      <label className="block text-gray-700">Repeat Task:</label>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggleRepeat}
          className="h-5 w-5"
        />
        {isChecked && (
          <select className="p-2 border rounded">
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default RepeatTask;
