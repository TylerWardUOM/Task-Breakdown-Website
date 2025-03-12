import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import admin from "firebase-admin";

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function GET() {
  const token = (await cookies()).get("authToken")?.value;

  if (!token) return NextResponse.json({ isAuthenticated: false, user: null });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await admin.auth().getUser(decodedToken.uid);

    return NextResponse.json({ isAuthenticated: true, user: { email: user.email, uid: user.uid } });
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false, user: null });
  }
}
