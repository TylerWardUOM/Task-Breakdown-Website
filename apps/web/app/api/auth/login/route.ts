import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieOptions } from "../../../../lib/cookieOptions";

// Helper function to set authentication cookies
const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set("authToken", token, cookieOptions);
};

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: { code: "auth/missing-token", message: "No ID token provided." } },
        { status: 400 }
      );
    }

    // ✅ Save the token in a secure cookie
    await setAuthCookie(idToken);

    return NextResponse.json(
      { message: "Authentication successful." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error setting auth cookie:", error);

    return NextResponse.json(
      { error: { code: "auth/unknown-error", message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
