import { FilterIcon, XIcon } from "@heroicons/react/solid";
import { Category } from "@GlobalTypes/Category";
import { Filter } from "@FrontendTypes/filter";
import { useFilterMenu } from "@Hooks/useFilterMenu";

interface FilterMenuProps {
  categories: Category[];
  onFilterChange: (filters: Filter) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ categories, onFilterChange }) => {
  const {
    isDropdownOpen,
    setIsDropdownOpen,
    tempFilterState,
    handleFilterChange,
    handleCategoryChange,
    handleApplyFilters,
    handleClearFilters,
    setTempFilterState,
    handleCancel,
    dropdownRef,
  } = useFilterMenu({ categories, onFilterChange });

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      <button
        onMouseDown={toggleDropdown}
        className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        aria-label="Filter Menu"
      >
        <FilterIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>

      {isDropdownOpen && (
        <div         
        ref={dropdownRef}
        className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-300 dark:border-gray-600 p-4 z-50 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Filters</h3>
            <button
              onMouseDown={() => setIsDropdownOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              aria-label="Filter Menu"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-900 dark:text-gray-300">Quick Filters:</label>
            <div className="space-y-1 text-sm">
              {[
                { value: "thisWeek", label: "Due This Week" },
                { value: "Priority>7", label: "Priority > 7" },
                { value: "priorityRange", label: "Priority Range" },
                { value: "overDue", label: "Over Due" },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center space-x-2 text-gray-900 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={tempFilterState.filter === value}
                    onChange={() => handleFilterChange(value)}
                    className="rounded accent-blue-500 dark:accent-blue-400 transition-colors"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {tempFilterState.filter === "priorityRange" && (
            <div className="mt-2 text-sm">
              <label className="block font-medium text-gray-900 dark:text-gray-300">Priority Range:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tempFilterState.minPriority}
                  onChange={(e) =>
                    setTempFilterState((prev) => ({
                      ...prev,
                      minPriority: Math.min(Number(e.target.value), prev.maxPriority),
                    }))
                  }
                  className="w-14 border rounded p-1 text-center bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 border-gray-300 transition-colors"
                  aria-label="Minimum priority"
                />
                <span className="text-gray-900 dark:text-gray-300">-</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tempFilterState.maxPriority}
                  onChange={(e) =>
                    setTempFilterState((prev) => ({
                      ...prev,
                      maxPriority: Math.max(Number(e.target.value), prev.minPriority),
                    }))
                  }
                  className="w-14 border rounded p-1 text-center bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 border-gray-300 transition-colors"
                  aria-label="Maximum priority"
                />
              </div>
            </div>
          )}

          <div className="mt-2">
            <label className="flex items-center space-x-2 text-sm text-gray-900 dark:text-gray-300">
              <input
                type="checkbox"
                checked={tempFilterState.filterByCategory}
                onChange={() =>
                  setTempFilterState((prev) => ({ ...prev, filterByCategory: !prev.filterByCategory }))
                }
                className="rounded accent-blue-500 dark:accent-blue-400 transition-colors"
              />
              <span>Filter by Category</span>
            </label>

            {tempFilterState.filterByCategory && (
              <div className="max-h-28 overflow-y-auto mt-2 border rounded p-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 border-gray-300 transition-colors">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={tempFilterState.selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="rounded accent-blue-500 dark:accent-blue-400 transition-colors"
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-between text-sm">
            <button
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Clear Filters
            </button>
            <div className="space-x-2">
              <button
                onClick={() => handleCancel()}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterMenu;
