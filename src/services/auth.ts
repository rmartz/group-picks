import {
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(getClientAuth(), email, password);
}

export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(getClientAuth(), email, password);
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(getClientAuth(), email);
}

export async function signOut() {
  return firebaseSignOut(getClientAuth());
}

async function signInWithOAuthProvider(
  provider: GoogleAuthProvider | OAuthProvider,
) {
  const credential = await signInWithPopup(getClientAuth(), provider);
  try {
    await createSession(await credential.user.getIdToken());
  } catch (err) {
    await firebaseSignOut(getClientAuth());
    throw err;
  }
}

export async function signInWithGoogle() {
  return signInWithOAuthProvider(new GoogleAuthProvider());
}

export async function signInWithApple() {
  return signInWithOAuthProvider(new OAuthProvider("apple.com"));
}

export async function createSession(idToken: string) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) throw new Error("Failed to create session");
}

export async function deleteSession() {
  const response = await fetch("/api/auth/session", { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete session");
}

export async function updateDisplayName(displayName: string) {
  const user = getClientAuth().currentUser;
  if (!user) throw new Error("No authenticated user");
  await updateProfile(user, { displayName });
}
