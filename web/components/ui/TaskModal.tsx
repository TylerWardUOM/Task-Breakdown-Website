// TaskModal.tsx

import React from "react";
import { useState } from 'react';
import ColourChangingSlider from "./ColourChangingSlider";



const TaskModal: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
    // Define state for the importance slider and the duration slider
    const [importanceValue, setImportanceValue] = useState(5);

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-bold">Create/Edit Task</h2>
      <div className="mt-4 space-y-4">
        <label className="block text-gray-700">Task Title:</label>
        <input type="text" placeholder="Task Title" className="w-full p-2 border rounded" />

        <label className="block text-gray-700">Due Date:</label>
        <input type="date" className="w-full p-2 border rounded" />

        <label className="block text-gray-700">Estimated Task Duration:</label>
        <input type="number" placeholder="Duration (minutes)" className="w-full p-2 border rounded" />

        {/* Task Importance Slider with Color Change */}
        <ColourChangingSlider
                label="Task Importance"
                min={1}
                max={10}
                value={importanceValue}
                onChange={setImportanceValue}
                lowText="Low"
                highText="High"
                />
        <label className="block text-gray-700">Category:</label>
        <select className="w-full p-2 border rounded">
          <option>Work</option>
          <option>Chores</option>
          <option>Personal</option>
        </select>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Add Subtask</button>
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Cancel</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={onSave}>Save Task</button>
      </div>
    </div>
  );
};

export default TaskModal;
