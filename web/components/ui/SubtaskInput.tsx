import React, { useState } from "react";
import ColourChangingSlider from "./ColourChangingSlider";  // Assuming you have this for importance

interface SubtaskInputProps {
  onAddSubtask: (subtask: any) => void;
  nextId: number;  // Pass the next available ID as a prop
}

const SubtaskInput: React.FC<SubtaskInputProps> = ({ onAddSubtask, nextId }) => {
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [duration, setDuration] = useState(0);
  const [importanceValue, setImportanceValue] = useState(5);
  const [dependency, setDependency] = useState<string | undefined>("");

  const handleAdd = () => {
    if (subtaskTitle.trim() !== "") {
      const newSubtask = {
        id: nextId,  // Use the next available ID
        title: subtaskTitle,
        duration,
        importance: importanceValue,
        dependency,
      };
      onAddSubtask(newSubtask); // Pass new subtask to parent
      setSubtaskTitle(""); // Reset the input fields
      setDuration(0);
      setImportanceValue(5);
      setDependency(undefined);
    }
  };

  return (
    <div>
      <label className="block text-gray-700">Subtask Title:</label>
      <input
        type="text"
        placeholder="Subtask Title"
        className="w-full p-2 border rounded"
        value={subtaskTitle}
        onChange={(e) => setSubtaskTitle(e.target.value)}
      />

      <label className="block text-gray-700 mt-2">Estimated Duration (minutes):</label>
      <input
        type="number"
        placeholder="Duration"
        className="w-full p-2 border rounded"
        value={duration}
        onChange={(e) => setDuration(parseInt(e.target.value))}
      />

      <ColourChangingSlider
        label="Subtask Importance"
        min={1}
        max={10}
        value={importanceValue}
        onChange={setImportanceValue}
        lowText="Low"
        highText="High"
      />

      <label className="block text-gray-700 mt-2">Dependency:</label>
      <input
        type="text"
        placeholder="Depends on another subtask (ID)"
        className="w-full p-2 border rounded"
        value={dependency || ""}
        onChange={(e) => setDependency(e.target.value)}
      />

      <div className="flex justify-end mt-4">
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Subtask
        </button>
      </div>
    </div>
  );
};

export default SubtaskInput;
