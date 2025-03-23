import { useState, useEffect } from "react";
import { Category } from "@GlobalTypes/Category";
import { useApiWrapper } from "./useApiWrapper";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchCategories } = useApiWrapper(); // ✅ Wrapped API call

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
