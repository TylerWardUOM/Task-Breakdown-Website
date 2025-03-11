import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification } from "firebase/auth";
import {app} from "../../../../lib/firebase"  // Import Firebase instance

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
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    });

    return NextResponse.json({ message: "User registered. Please verify email." }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
