import { useEffect, useRef, useState } from "react";
import { Category } from "@GlobalTypes/Category";
import { Filter } from "@FrontendTypes/filter";

interface UseFilterMenuProps {
  categories: Category[];
  onFilterChange: (filters: Filter) => void;
}

export function useFilterMenu({ categories, onFilterChange }: UseFilterMenuProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [savedFilterState, setSavedFilterState] = useState({
    filter: null as string | null,
    minPriority: 1,
    maxPriority: 10,
    selectedCategories: [] as number[],
    filterByCategory: false,
  });

  const [tempFilterState, setTempFilterState] = useState(savedFilterState);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleCancel();
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
    setTempFilterState((prev) => ({ ...prev, filter: prev.filter === selectedFilter ? null : selectedFilter }));
  };

  const handleCategoryChange = (categoryId: number) => {
    setTempFilterState((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter((c) => c !== categoryId)
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

  const handleCancel = () => {
    setTempFilterState(savedFilterState); // Reset temp state to last saved filters
    setIsDropdownOpen(false);
  };

  return {
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
  };
}
