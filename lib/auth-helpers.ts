import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { auth, db, firebaseConfig } from "./firebase";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@amaranggana.farm";

// ─── AUTH ──────────────────────────────────────────
export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  // Set custom parameters or scopes if needed
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function adminRegisterMitra(
  email: string,
  password: string,
  displayName: string,
  organizationName: string
) {
  const secondaryApp = getApps().find((app) => app.name === "Secondary") 
    || initializeApp(firebaseConfig, "Secondary");
  const secondaryAuth = getAuth(secondaryApp);

  const result = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  await updateProfile(result.user, { displayName });

  const isFirstAdmin = email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
  const role = isFirstAdmin ? "admin" : "mitra";

  await setDoc(doc(db, "users", result.user.uid), {
    email: email.toLowerCase().trim(),
    displayName,
    role,
    organizationName,
    deviceTokens: [],
    createdAt: new Date().toISOString(),
  });

  await signOut(secondaryAuth);
  return result.user;
}

export async function logoutUser() {
  await signOut(auth);
}

// ─── USER MANAGEMENT ──────────────────────────────
export async function getAllMitra() {
  const q = query(collection(db, "users"), where("role", "==", "mitra"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function getUserProfile(uid: string) {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return { uid: userDoc.id, ...userDoc.data() };
  }
  return null;
}

export async function deleteUser(uid: string) {
  await deleteDoc(doc(db, "users", uid));
}

// ─── DEVICE ASSIGNMENT ────────────────────────────
export async function assignDeviceToUser(userId: string, deviceToken: string) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    deviceTokens: arrayUnion(deviceToken),
  });
}

export async function removeDeviceFromUser(userId: string, deviceToken: string) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    deviceTokens: arrayRemove(deviceToken),
  });
}
