import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth, sendEmailVerification, signInWithCredential, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
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
        await sendEmailVerification(user);
      }

      // Step 3: Get Firebase ID token
      const token = await userCredential.user.getIdToken();     

      // Step 4: Set token in HTTP-only secure cookie
      const cookieStore = await cookies();
      cookieStore.set("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ message: "User signed in successfully with Google." }, { status: 200 });
    } else {
      // Step 1: Handle email/password registration
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Send email verification
      await sendEmailVerification(user);
      await auth.signOut(); // Ensure user is signed out after registration

      // Step 3: Get Firebase ID token
      const token = await user.getIdToken();

      // Step 4: Set token in HTTP-only secure cookie
      const cookieStore = await cookies();
      cookieStore.set("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ message: "User registered successfully. Please verify your email." }, { status: 201 });
    }
  } catch (error: unknown) {
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
