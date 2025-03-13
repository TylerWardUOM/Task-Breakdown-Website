import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../../../../lib/firebase"; // Import Firebase instance
import { FirebaseError } from "firebase/app";

const auth = getAuth(app);

export async function POST(req: Request) {
  try {
    const { email, password, google, idToken, accessToken } = await req.json();
    if (google) {
      // Step 1: Handle Google sign-in
      const googleCredential = GoogleAuthProvider.credential(idToken, accessToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;

      // Step 2: Send email verification (not necessary for Google login but included for consistency)
      if (!user.emailVerified) {
        return NextResponse.json({ error: "Email not verified." }, { status: 403 });
      }

      // Step 3: Get Firebase ID token
      const token = await userCredential.user.getIdToken();     

      // Step 4: Set token in HTTP-only secure cookie
      const cookieStore = await cookies();
      cookieStore.set("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ message: "User signed in successfully with Google." }, { status: 200 });
    } 
    else{
    // Step 1: Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json({ error: "Email not verified." }, { status: 403 });
    }

    // Step 3: Get Firebase Token
    const token = await user.getIdToken();

    // Step 4: Store the token in an HTTP-only secure cookie
    const cookieStore = await(cookies()); // No need to await this function
    cookieStore.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    });

    return NextResponse.json({ message: "Login successful.", user: { email: user.email } });
  }
  } catch (error) {
    console.error("Login error:", error);

    // Handle Firebase authentication errors
    if (error instanceof FirebaseError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: 401 }
      );
    }

    // Fallback for other errors
    return NextResponse.json(
      { error: { code: "auth/unknown-error", message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}