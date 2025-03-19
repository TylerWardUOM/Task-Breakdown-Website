import { Category } from "@GlobalTypes/Category";
import { fetchCategories } from "../lib/api";
import { useState, useEffect } from "react";


const useFetchCategories = () => {
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

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch categories");
        }
      } finally {
        setLoadingCategories(false);
      }
    };

    getCategories();
  }, []);

  return { categories, loadingCategories, error, setCategories };
};

export default useFetchCategories;
