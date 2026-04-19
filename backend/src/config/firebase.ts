import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let serviceAccount: admin.ServiceAccount;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (serviceAccountJson) {
  // If the environment variable contains a JSON string, parse it
  serviceAccount = JSON.parse(serviceAccountJson);
} else {
  // Fallback to local file path for local development
  serviceAccount = require("../../serviceAccountKey.json");
}

// Initialize Firebase Admin only if it hasn't been initialized already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Export the initialized Firebase Admin instance
export default admin;
