import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut,
  updateProfile, type User} from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { AuthContext } from "./AuthContext";
import { type UserProfile } from "./types";

const API_BASE = "http://127.0.0.1:8000";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const idToken = await firebaseUser.getIdToken();
      setUser(firebaseUser);
      setToken(idToken);

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (!res.ok) throw new Error();

        const data: UserProfile = await res.json();
        setProfile(data);
      } catch {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 🔐 LOGIN
  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });

    if (!res.ok) {
      await signOut(auth);
      throw new Error("User not found. Please sign up.");
    }
  };

  // 🆕 SIGNUP
  const signup = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(cred.user, { displayName: name });

    const idToken = await cred.user.getIdToken();

    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      await signOut(auth);
      throw new Error("User already exists. Please login.");
    }
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const idToken = await cred.user.getIdToken();

    let res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });


    if (res.status === 404) {
      res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, token, loading, login, signup, loginWithGoogle, logout}}>
      {children}
    </AuthContext.Provider>
  );
};
