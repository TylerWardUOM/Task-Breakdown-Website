import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth, sendEmailVerification, signInWithCredential, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../../../../lib/firebase"; // Import Firebase instance
import { FirebaseError } from "firebase/app";

const auth = getAuth(app);

export async function POST(req: Request) {
  try {
    const { email, password, google, idToken, accessToken } = await req.json();
    let userCredential;

    if (google) {
      // Step 1: Handle Google sign-in
      const googleCredential = GoogleAuthProvider.credential(idToken, accessToken);
      userCredential = await signInWithCredential(auth, googleCredential);
    } else {
      // Step 1: Handle email/password registration
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    }

    const user = userCredential.user;

    // Step 2: Send email verification (only necessary for email/password sign-up)
    if (!google) {
      await sendEmailVerification(user);
      await auth.signOut(); // Ensure user is signed out after registration
    }

    // Step 3: Get Firebase ID token
    const token = await user.getIdToken();

    // Step 4: Set token in HTTP-only secure cookie
    const cookieStore = await cookies();
    cookieStore.set("authToken", token, {
        httpOnly: true,
        secure: process.env.NEXT_PUBLIC_NODE_ENV === "production", // This ensures the cookie is only sent over HTTPS
        path: "/",
        domain: ".taskmanager.shop", // This makes the cookie available to both subdomains
        sameSite: "lax", // Required for cross-origin requests between subdomains
        maxAge: 60 * 60 * 24 * 7, // 7 Days
    });
    return NextResponse.json({
      message: google ? "User signed in successfully with Google." : "User registered successfully. Please verify your email.",
      user,
    },{ status: google ? 200 : 201 });
  } catch (error) {

    console.error("Unexpected Register Error:", error);
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
