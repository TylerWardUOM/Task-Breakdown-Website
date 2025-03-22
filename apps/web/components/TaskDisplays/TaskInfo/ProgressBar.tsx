const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="relative w-32 h-4 bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden">
      <div
        className="h-full bg-green-500 transition-all ease-in-out duration-300"
        style={{ width: `${progress}%` }} // Dynamically set width
        aria-label={`Task progress: ${progress.toFixed(0)}%`}
      ></div>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white dark:text-black">
        {progress.toFixed(0)}%
      </span>
    </div>
  );
};

export default ProgressBar;
