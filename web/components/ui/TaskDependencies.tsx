import React from "react";

interface TaskDependenciesProps {
  dependency: string | undefined;
  onChange: (task: string) => void;
}

const TaskDependencies: React.FC<TaskDependenciesProps> = ({ dependency, onChange }) => {
  return (
    <div>
      <label className="block text-gray-700">Task Dependency:</label>
      <select
        className="w-full p-2 border rounded"
        value={dependency}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">None</option>
        {/* Example tasks for now */}
        <option value="Set up computer">Set up computer</option>
        <option value="Build website">Build website</option>
        {/* Add dynamically loaded tasks here */}
      </select>
    </div>
  );
};

export default TaskDependencies;
