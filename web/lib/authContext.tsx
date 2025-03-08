// authContext.tsx
"use client";
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { getAuth, onAuthStateChanged, getIdToken } from "firebase/auth"; 
import { app } from "./firebase"; 
import { getUserData } from "./user"; 
import { useRouter } from "next/navigation";  // Import useRouter

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  loading: boolean;
  firebaseToken: string | null;
  redirectToLogin: () => void; // Add redirect function here
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);
  const router = useRouter(); // Initialize the router

  const redirectToLogin = () => {
    router.push("/login"); // Perform the redirection to login page
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("firebaseToken");
    if (storedToken) {
      setFirebaseToken(storedToken);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);

        const fetchedUserData = await getUserData();
        if (fetchedUserData) {
          setUserName(fetchedUserData.username);
        }

        const token = await getIdToken(user);
        setFirebaseToken(token);
        localStorage.setItem("firebaseToken", token);
      } else {
        setIsAuthenticated(false);
        setUserName(null);
        setFirebaseToken(null);
        localStorage.removeItem("firebaseToken");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userName, 
      loading, 
      firebaseToken, 
      redirectToLogin // Provide redirectToLogin function in context
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
