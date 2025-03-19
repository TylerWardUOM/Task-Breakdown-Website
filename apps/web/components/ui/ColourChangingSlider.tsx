import React from "react";

interface ColourChangingSliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  lowText: string;
  highText: string;
}

const ColourChangingSlider: React.FC<ColourChangingSliderProps> = ({
  label,
  min,
  max,
  value,
  onChange,
  lowText,
  highText,
}) => {
  const colours = [
    "green",
    "green",
    "green",
    "lightgreen",
    "yellow",
    "yellow",
    "orange",
    "orangered",
    "red",
    "red",
  ];

  const colour = colours[value - 1];

  return (
    <div className="mt-4">
      <label htmlFor="slider" className="block text-gray-700">
        {label}
      </label>
      <div className="flex items-center justify-between">
        <span className="text-gray-500">{lowText}</span>
        <input
          id="slider" // Adding the id for the label to associate with
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full appearance-none h-2 rounded-lg bg-gray-300"
          aria-label={`${label} slider`} // Descriptive label for screen readers
          style={{
            background: `linear-gradient(to right, 
              ${colour} 0%, 
              ${colour} ${(value - 1) * 10}%, 
              gray ${(value - 1) * 10}%)`,
          }}
        />
        <span className="text-red-500 font-bold">{highText}</span>
      </div>
    </div>
  );
};

export default ColourChangingSlider;
