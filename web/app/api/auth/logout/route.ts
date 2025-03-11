import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Clear the authentication cookie
  const cookieStore = await(cookies())
  cookieStore.set("authToken", "", { expires: new Date(0) });

  return NextResponse.json({ message: "Logout successful." });
}
