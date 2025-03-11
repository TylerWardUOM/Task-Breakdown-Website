"use client";
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation"; 
import { getUserData } from "../lib/user";

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  loading: boolean;
  logout: () => void;
  redirectToLogin: () => void;
  setIsSigningUp: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false); 
  const router = useRouter();
  const pathname = usePathname();

  const redirectToLogin = () => router.push("/login");

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setIsAuthenticated(false);
    setUserName(null);
    redirectToLogin();
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        
        const res = await fetch("/api/auth/session", { credentials: "include" });
        if (!res.ok) throw new Error("Session check failed");

        const data = await res.json();

        if (data.isAuthenticated) {
          try {
            // Fetch user data only if not signing up
            if (!isSigningUp) {
              const fetchedUserData = await getUserData();
              if (fetchedUserData) {
                setUserName(fetchedUserData.username);
              }
            }

            setIsAuthenticated(true);
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUserName(null);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Session validation failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [isSigningUp, pathname]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, loading, setIsSigningUp, logout, redirectToLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
