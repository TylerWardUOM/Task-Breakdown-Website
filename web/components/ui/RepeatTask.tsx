import React from "react";

interface RepeatTaskProps {
  isChecked: boolean;
  onToggleRepeat: () => void;
}

const RepeatTask: React.FC<RepeatTaskProps> = ({ isChecked, onToggleRepeat }) => {
  return (
    <div>
      <label htmlFor="repeatCheckbox" className="block text-gray-700">
        Repeat Task:
      </label>
      <div className="flex items-center space-x-2">
        <input
          id="repeatCheckbox"
          type="checkbox"
          checked={isChecked}
          onChange={onToggleRepeat}
          className="h-5 w-5"
          aria-labelledby="repeatCheckboxLabel"  // This connects the checkbox with its label
        />
        {isChecked && (
          <select
            className="p-2 border rounded"
            aria-label="Select repeat frequency"  // Provides context to screen readers
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default RepeatTask;
