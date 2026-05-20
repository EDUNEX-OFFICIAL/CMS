import admin from "firebase-admin";
import { getEnv } from "../config/env";

let initialized = false;

export function getFirebaseAuth(): admin.auth.Auth {
  if (!initialized) {
    const env = getEnv();
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.firebasePrivateKey,
        }),
      });
    }
    initialized = true;
  }
  return admin.auth();
}

export async function verifyFirebaseIdToken(idToken: string) {
  const decoded = await getFirebaseAuth().verifyIdToken(idToken);
  return {
    firebaseUid: decoded.uid,
    email: decoded.email ?? "",
    displayName: decoded.name ?? null,
    avatarUrl: decoded.picture ?? null,
  };
}
