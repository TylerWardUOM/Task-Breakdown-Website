import { PencilIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from "@heroicons/react/solid";

interface Task {
  id: number;
  title: string;
  priority: number;
  dueDate: string;
  duration: number;
  category: string;
  isCompleted: boolean;
}

interface TaskTableProps {
  tasks: Task[];
  onEdit?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  onFocus?: (taskId: number) => void;
  renderActions?: (task: Task) => JSX.Element; // Custom actions
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, onEdit, onComplete, onDelete, onFocus, renderActions }) => {
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg mt-4">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">Task Title</th>
            <th className="py-2 px-4 text-left">Priority</th>
            <th className="py-2 px-4 text-left">Due Date</th>
            <th className="py-2 px-4 text-left">Category</th>
            <th className="py-2 px-4 text-left">Duration</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className={task.isCompleted ? "opacity-50" : ""}>
              <td className="py-2 px-4">
                <span className={task.isCompleted ? "line-through text-gray-400" : ""}>
                  {task.title}
                </span>
              </td>
              <td className="py-2 px-4">
                <div className="flex items-center">
                  {[...Array(task.priority)].map((_, index) => (
                    <span key={index} className="text-yellow-500">★</span>
                  ))}
                </div>
              </td>
              <td className="py-2 px-4">{task.dueDate}</td>
              <td className="py-2 px-4">{task.category}</td>
              <td className="py-2 px-4">{task.duration} hours</td>
              <td className="py-2 px-4 flex space-x-2">
                {renderActions ? renderActions(task) : (
                  <>
                    {onEdit && (
                      <button onClick={() => onEdit(task.id)} className="bg-green-500 text-white px-4 py-2 rounded">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {onComplete && (
                      <button onClick={() => onComplete(task.id)} className={`px-4 py-2 rounded ${task.isCompleted ? "bg-red-500" : "bg-yellow-500"}`}>
                        {task.isCompleted ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(task.id)} className="bg-red-500 text-white px-4 py-2 rounded">
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                    {onFocus && (
                      <button onClick={() => onFocus(task.id)} className="bg-purple-500 text-white px-4 py-2 rounded flex items-center space-x-2">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
