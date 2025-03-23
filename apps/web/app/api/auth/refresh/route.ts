import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieOptions } from "lib/cookieOptions";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 400 }
      );
    }

    const cookieStore = await(cookies());
    const existingToken = cookieStore.get("authToken");

    if (!existingToken) {
      return NextResponse.json(
        { success: false, error: "Session expired. Please log in again." },
        { status: 401 } // Unauthorized
      );
    }

    // ✅ Update token in cookies
    cookieStore.set("authToken", token, cookieOptions);

    return NextResponse.json({ success: true, message: "Token refreshed successfully" });
  } catch (error) {
    console.error("❌ Error refreshing auth token:", error);
    return NextResponse.json(
      { success: false, error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
