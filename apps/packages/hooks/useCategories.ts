import { useState, useEffect } from "react";
import { Category } from "@GlobalTypes/Category";
import { fetchCategories } from "../lib/api";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories(); // Fetch categories from API
        setCategories(data);
      } catch (err: unknown) {
        console.error("Error fetching categories:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    getCategories();
  }, []);

  return { categories, setCategories, loadingCategories, error };
};
