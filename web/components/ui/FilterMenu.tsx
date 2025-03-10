import { useState, useRef, useEffect } from "react";
import { Category } from "../../types/Category";
import { FilterIcon, XIcon } from "@heroicons/react/solid";
import { Filter } from "../../types/Filter";

interface FilterMenuProps {
  categories: Category[];
  onFilterChange: (filters: Filter) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ categories, onFilterChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [savedFilterState, setSavedFilterState] = useState<{
    filter: string | null;
    minPriority: number;
    maxPriority: number;
    selectedCategories: number[];
    filterByCategory: boolean;
  }>({
    filter: null,
    minPriority: 1,
    maxPriority: 10,
    selectedCategories: [],
    filterByCategory: false,
  });
  
  const [tempFilterState, setTempFilterState] = useState(savedFilterState);
  
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTempFilterState(savedFilterState);
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, savedFilterState]);

  const handleFilterChange = (selectedFilter: string) => {
    setTempFilterState(prev => ({ ...prev, filter: prev.filter === selectedFilter ? null : selectedFilter }));
  };

  const handleCategoryChange = (categoryId: number) => {
    setTempFilterState(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(c => c !== categoryId)
        : [...prev.selectedCategories, categoryId],
    }));
  };

  const handleApplyFilters = () => {
    setSavedFilterState(tempFilterState);
    onFilterChange(tempFilterState);
    setIsDropdownOpen(false);
  };

  const handleClearFilters = () => {
    const resetState = {
      filter: null,
      minPriority: 1,
      maxPriority: 10,
      selectedCategories: [],
      filterByCategory: false,
    };
    setTempFilterState(resetState);
    setSavedFilterState(resetState);
    onFilterChange(resetState);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the event from bubbling up to the document
    setIsDropdownOpen(prev => !prev);
  };

  return (
    <div className="relative">
      <button onMouseDown={toggleDropdown} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none" aria-label="Filter Menu">
        <FilterIcon className="w-6 h-6 text-gray-600" />
      </button>
      {isDropdownOpen && (
        <div ref={dropdownRef} className="absolute left-0 mt-2 w-64 bg-white shadow-lg rounded-md border p-4 z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">Filters</h3>
            <button onMouseDown={() => setIsDropdownOpen(false)} className="text-gray-500 hover:text-gray-700">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            <label className="block text-sm">Quick Filters:</label>
            <div className="space-y-1 text-sm">
              {[
                { value: "thisWeek", label: "Due This Week" },
                { value: "Priority>7", label: "Priority > 7" },
                { value: "priorityRange", label: "Priority Range" },
                { value: "overDue", label: "Over Due" }
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={tempFilterState.filter === value}
                    onChange={() => handleFilterChange(value)}
                    className="rounded"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          {tempFilterState.filter === "priorityRange" && (
            <div className="mt-2 text-sm">
              <label className="block font-medium">Priority Range:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tempFilterState.minPriority}
                  onChange={e => setTempFilterState(prev => ({ ...prev, minPriority: Math.min(Number(e.target.value), prev.maxPriority) }))}
                  className="w-14 border rounded p-1 text-center"
                  aria-label="Minimum priority"
                />
                <span>-</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tempFilterState.maxPriority}
                  onChange={e => setTempFilterState(prev => ({ ...prev, maxPriority: Math.max(Number(e.target.value), prev.minPriority) }))}
                  className="w-14 border rounded p-1 text-center"
                  aria-label="Maximum priority"
                />
              </div>
            </div>
          )}
          <div className="mt-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={tempFilterState.filterByCategory}
                onChange={() => setTempFilterState(prev => ({ ...prev, filterByCategory: !prev.filterByCategory }))}
                className="rounded"
              />
              <span>Filter by Category</span>
            </label>
            {tempFilterState.filterByCategory && (
              <div className="max-h-28 overflow-y-auto mt-2 border rounded p-2 text-sm">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={tempFilterState.selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="rounded"
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <button onClick={handleClearFilters} className="text-gray-500 hover:text-gray-700">Clear Filters</button>
            <div className="space-x-2">
              <button onClick={() => setIsDropdownOpen(false)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
              <button onClick={handleApplyFilters} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterMenu;
