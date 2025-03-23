import { useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { resendVerificationEmail, handleAuthLoginResponse, logoutUser} from "../lib/auth";
import { markUserAsVerified } from "@lib/api";


export const useAuthLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const router = useRouter();

  const handleRegisterRedirect = () => router.push("/register");
  const handlePasswordResetRedirect = () => router.push("/resetPassword");
  const handleDashboardRedirect = () => router.push("/user/dashboard");


  // 🔥 Function to map Firebase authentication error codes to user-friendly messages
  const mapAuthErrorMessage = (error: FirebaseError): string => {
    const errorMessages: Record<string, string> = {
      "auth/user-not-found": "No account found with this email. Please sign up first.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-credential": "Invalid credentials. Please try again.",
      "auth/invalid-email": "Invalid email format. Please enter a valid email.",
      "auth/too-many-requests": "Too many failed attempts. Please wait a moment and try again.",
      "auth/user-disabled": "This account has been disabled. Please contact support.",
      "auth/network-request-failed": "Network error. Please check your internet connection.",
      "auth/email-not-verified": "Your email is not verified. Please check your inbox for a verification email.",
      "auth/database-error": "There was an issue updating your account status. Please try again later.",
      "auth/user-error": "User does not exist in database. Register Again"
    };
  
    return errorMessages[error.code] || "An unexpected error occurred.";
  };
  


  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Ensure the user's email is verified before proceeding
      if (!user.emailVerified) {
        setEmailVerified(false);
        throw new FirebaseError("auth/email-not-verified", "Your email is not verified.");
    }
        
      // ✅ Handle authentication response and return result
      await handleAuthLoginResponse(userCredential);
    // ✅ Mark user as verified in the database
    try {
    await markUserAsVerified(email);
    } catch (error) {
    console.error("Error verifying user in database:", error);
    logoutUser();
    throw new FirebaseError("auth/database-error", "Failed to update verification status.");
    }
      handleDashboardRedirect();
    } catch (error){
        if (error instanceof FirebaseError){
            setError(mapAuthErrorMessage(error));
        }
        else{
            setError("Unkown Error Occurred.")
        }
    }
    finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // ✅ Google sign-in does not require email verification check

    

      await handleAuthLoginResponse(userCredential);
      // ✅ Mark user as verified in the database
      try {
        await markUserAsVerified(user.email!);
      } catch (error) {
        console.error("Error verifying user in database:", error);
        logoutUser();
        throw new FirebaseError("auth/database-error", "Failed to update verification status.");
      }
      handleDashboardRedirect();
    } catch (error){
        if (error instanceof FirebaseError){
            setError(mapAuthErrorMessage(error));
        }
        else{
            setError("Unkown Error Occurred.")
        }
    }finally {
      setLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    try {
      const response = await resendVerificationEmail(email, password);
      setSuccess(response.message);
      setError("");
    } catch  {
      setError("Failed to send verification email. Please try again later.");
    }
  };



  const handleUnexpectedError = (error: unknown) => {
    console.error("Login Error:", error);
    if (error instanceof FirebaseError || error instanceof Error) {
      setError(error.message || "An unexpected error occurred.");
    } else {
      setError("An unexpected error occurred.");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    success,
    loading,
    emailVerified,
    signInWithEmail,
    signInWithGoogle,
    handleResendVerificationEmail,
    handleRegisterRedirect,
    handlePasswordResetRedirect,
    handleUnexpectedError,
  };
};
