"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Auth methods
import { app } from "./firebase"; // Firebase app initialization file
import { getUserData } from "./user"; // Import your function to get user data

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Firebase Auth
const auth = getAuth(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        
        // Fetch user data from backend once authenticated
        const fetchedUserData = await getUserData(); // Assuming this function fetches data from your backend
        if (fetchedUserData) {
          setUserName(fetchedUserData.username);
        }
      } else {
        setIsAuthenticated(false);
        setUserName(null);
      }
      setLoading(false); // Set loading to false after checking the auth state
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
