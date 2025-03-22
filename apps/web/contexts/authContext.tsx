"use client";
import { createContext, useState, useEffect, useContext, ReactNode} from "react";
import { useRouter, usePathname } from "next/navigation"; 
import { getUserData } from "../lib/user";
import { useApi } from "lib/useApi";

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  loading: boolean;
  logout: () => void;
  redirectToLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const {apiCall} = useApi()
  const router = useRouter();
  const pathname = usePathname();

  const redirectToLogin = () => router.push("/login");

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setIsAuthenticated(false);
    setUserName(null);
    redirectToLogin();
  };

  const sessionRequest = async () => {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    if (!res.ok) {
      let errorMessage = `Session check failed with status ${res.status}`;
      
      try {
        const errorData = await res.json(); // Try to parse error response
        if (errorData?.error) {
          errorMessage = errorData.error; // Use API-provided error message if available
        }
      } catch {
        // Ignore JSON parsing errors and fallback to default message
      }
      throw new Error(errorMessage); // Throw detailed error
    }
    return res.json(); // Return parsed response
  };
  

  const checkSession = async () => {
    try {
      setLoading(true);
      const data = await apiCall(() => sessionRequest());
  
      if (data.isAuthenticated) {
        try {
          // Fetch user data
          const fetchedUserData = await apiCall(() => getUserData());
          if (fetchedUserData) {
            setUserName(fetchedUserData.username);
          }
  
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName(null);
          setIsAuthenticated(false);
          router.push("/login"); // 🔥 Redirect if user data fetch fails
        }
      } else {
        setIsAuthenticated(false);
        router.push("/login"); // 🔥 Redirect if not authenticated
      }
    } catch (error) {
      console.error("Session validation failed:", error);
      setIsAuthenticated(false);
      router.push("/login"); // 🔥 Redirect on error
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    checkSession();
  }, [pathname]);
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, loading, logout, redirectToLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
