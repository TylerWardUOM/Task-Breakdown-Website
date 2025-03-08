import React from "react";

interface BasicSliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  lowText: string;
  highText: string;
}

const BasicSlider: React.FC<BasicSliderProps> = ({ label, min, max, value, onChange, lowText, highText }) => {
  return (
    <div className="mt-4">
      <label htmlFor="basic-slider" className="block text-gray-700">
        {label}
      </label>
      <div className="flex items-center justify-between">
        <span className="text-gray-500">{lowText}</span>
        <input
          id="basic-slider" // Adding the id for the label to associate with
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full appearance-none h-2 rounded-lg bg-gray-300"
          aria-labelledby="basic-slider" // Accessible name for screen readers
        />
        <span className="text-red-500 font-bold">{highText}</span>
      </div>
    </div>
  );
};

export default BasicSlider;
