import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Get the cookies object
  const cookieStore = await(cookies());

  // Delete the authToken cookie by setting it with an immediate expiration
  cookieStore.delete("authToken");

  return NextResponse.json({ message: "Logout successful." }, { status: 200 });
}
