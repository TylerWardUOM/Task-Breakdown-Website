"use client";
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { getAuth, onAuthStateChanged, onIdTokenChanged, getIdToken, signOut } from "firebase/auth";
import { app } from "./firebase";
import { getUserData } from "./user";
import { useRouter } from "next/navigation"; 

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  loading: boolean;
  firebaseToken: string | null;
  logout: () => void;
  redirectToLogin: () => void;
  setIsSigningUp: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const auth = getAuth(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false); // Track signup state
  const router = useRouter();

  const redirectToLogin = () => {
    router.push("/login");
  };

  const logout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setUserName(null);
    setFirebaseToken(null);
    localStorage.removeItem("firebaseToken");
    redirectToLogin();
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure we only fetch user data after the user is authenticated
        setIsAuthenticated(true);
  
        try {
          if (!isSigningUp) { // Only get user data if not signing up
            const fetchedUserData = await getUserData();
            if (fetchedUserData) {
              setUserName(fetchedUserData.username);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // You can handle error here if needed, for example, setUserName to null or show error to the user
          setUserName(null); // Reset username if data fetch fails
        }
  
        const token = await getIdToken(user);
        setFirebaseToken(token);
        localStorage.setItem("firebaseToken", token);
      } else {
        // User is signed out
        logout();
      }
      setLoading(false);
    });

    // Monitor token changes and refresh it when needed
    const unsubscribeToken = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await getIdToken(user, true); // Force refresh token
        setFirebaseToken(token);
        localStorage.setItem("firebaseToken", token);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [isSigningUp]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userName, 
      loading, 
      firebaseToken, 
      logout, 
      redirectToLogin,
      setIsSigningUp
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
