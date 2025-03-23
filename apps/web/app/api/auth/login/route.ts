import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import { auth } from "../../../../lib/firebase"; // Firebase instance
import { FirebaseError } from "firebase/app";
import { cookieOptions } from "../../../../lib/cookieOptions";


// Helper function to set authentication cookies
const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set("authToken", token, cookieOptions);
};
// Helper function to handle login response
const handleLoginResponse = async (userCredential: UserCredential, isGoogleLogin: boolean) => {
  const user = userCredential.user;

  // Ensure email is verified for email/password login
  if (!isGoogleLogin && !user.emailVerified) {
    return NextResponse.json({ error: "Email not verified." }, { status: 403 });
  }

  // Get Firebase ID token
  const token = await user.getIdToken();

  // Set authentication token in cookies
  await setAuthCookie(token);

  return NextResponse.json({
    message: isGoogleLogin ? "User signed in successfully with Google." : "Login successful.",
    user: user,
  }, { status: 200 });
};

export async function POST(req: Request) {
  try {
    const { email, password, google, idToken, accessToken } = await req.json();
    let userCredential;

    if (google) {
      // Google login
      const googleCredential = GoogleAuthProvider.credential(idToken, accessToken);
      userCredential = await signInWithCredential(auth, googleCredential);
      return await handleLoginResponse(userCredential, true);
    } 
    
    // Email/password login
    userCredential = await signInWithEmailAndPassword(auth, email, password);
    return await handleLoginResponse(userCredential, false);


  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof FirebaseError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: 401 }
      );
    }

    // Fallback for unexpected errors
    return NextResponse.json(
      { error: { code: "auth/unknown-error", message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
