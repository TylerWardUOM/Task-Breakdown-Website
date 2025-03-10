import { useState, useEffect } from "react";
import { fetchCategories } from "../lib/api"; // Import API function
import { Category } from "../types/Category";

const useFetchCategories = (firebaseToken: string | null) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCategories = async () => {
      if (!firebaseToken) {
        setError("Authentication is required");
        setLoadingCategories(false);
        return;
      }

      try {
        const data = await fetchCategories(firebaseToken); // Fetch categories from API
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
  }, [firebaseToken]);

  return { categories, loadingCategories, error, setCategories };
};

export default useFetchCategories;
