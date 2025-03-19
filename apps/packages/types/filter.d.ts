export interface Filter {
    filter: string | null;
    minPriority: number;
    maxPriority: number;
    selectedCategories: number[]; // category ids
  }