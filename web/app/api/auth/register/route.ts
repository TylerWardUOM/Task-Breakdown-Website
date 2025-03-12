import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification } from "firebase/auth";
import {app} from "../../../../lib/firebase"  // Import Firebase instance
import { FirebaseError } from "firebase/app";

const auth = getAuth(app);

export async function POST(req: Request) {
  try {
    const { email, password} = await req.json();

    // Step 1: Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Send email verification
    await sendEmailVerification(user);
    await auth.signOut(); // Ensure user is signed out after registration

    // Step 3: Get Firebase Token
    const token = await user.getIdToken();

    // Step 4: Store the token in an HTTP-only secure cookie
    const cookieStore = await cookies(); // Await the cookies() function
    cookieStore.set("authToken", token, {
        httpOnly: true,
        secure: process.env.NEXT_PUBLIC_NODE_ENV === "production", // This ensures the cookie is only sent over HTTPS
        path: "/",
        domain: ".taskmanager.shop", // This makes the cookie available to both subdomains
        sameSite: "lax", // Required for cross-origin requests between subdomains
        maxAge: 60 * 60 * 24 * 7, // 7 Days
      });

    return NextResponse.json({ message: "User registered. Please verify email." }, { status: 201 });
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