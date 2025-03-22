import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieOptions } from "lib/cookieOptions";

// ✅ API route only sets the token in cookies
export async function POST(req: Request) {
  try {
    const { token } = await req.json(); // Extract token from request body

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 400 }
      );
    }

    // ✅ Store token in cookies
    const cookieStore = await cookies();
    cookieStore.set("authToken", token, cookieOptions);

    return NextResponse.json({ success: true, message: "Token stored" });
  } catch (error) {
    console.error("❌ Error setting auth cookie:", error);
    return NextResponse.json({ success: false, error: "Failed to set token" }, { status: 500 });
  }
}
