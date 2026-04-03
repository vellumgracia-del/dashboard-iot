"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "amarangganafarm@gmail.com";

export interface UserProfile {
  email: string;
  displayName: string;
  role: "admin" | "mitra";
  organizationName: string;
  deviceTokens: string[];
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (firebaseUser: User) => {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        
        // Auto-fix role to admin if the email matches but role is wrong (e.g. registered before as mitra)
        if (firebaseUser.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() && data.role !== "admin") {
          data.role = "admin";
          await setDoc(doc(db, "users", firebaseUser.uid), { role: "admin" }, { merge: true });
        }
        
        setUserProfile(data);
      } else {
        // Auto-create admin document if it's the admin logging in for the first time
        if (firebaseUser.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) {
          const newProfile: UserProfile = {
            email: firebaseUser.email.toLowerCase().trim(),
            displayName: firebaseUser.displayName || "Admin Amaranggana",
            role: "admin",
            organizationName: "AmarangganaFarm HQ",
            deviceTokens: [],
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", firebaseUser.uid), newProfile);
          setUserProfile(newProfile);
        } else {
          setUserProfile(null);
        }
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setUserProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
