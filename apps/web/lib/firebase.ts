import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "missing-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "missing-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "missing-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "missing-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "missing-messaging-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "missing-app-id",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const hasFirebaseConfig =
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) &&
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) &&
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) &&
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) &&
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

const getFirebaseApp = () => {
  if (!hasFirebaseConfig) {
    throw new Error("Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables.");
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
};

let firebaseAuth: ReturnType<typeof getAuth> | null = null;

export const getFirebaseAuth = () => {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  firebaseAuth = getAuth(getFirebaseApp());
  return firebaseAuth;
};
export const provider = new GoogleAuthProvider(); // Google provider instance
export const isFirebaseConfigured = hasFirebaseConfig;
