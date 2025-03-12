import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../../../../lib/firebase"; // Import Firebase instance
import { FirebaseError } from "firebase/app";

const auth = getAuth(app);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

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
      secure: process.env.NEXT_PUBLIC_NODE_ENV === "production", // This ensures the cookie is only sent over HTTPS
      path: "/",
      domain: ".taskmanager.shop", // This makes the cookie available to both subdomains
      sameSite: "lax", // Required for cross-origin requests between subdomains
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    });
    

    return NextResponse.json({ message: "Login successful.", user: { email: user.email } });
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