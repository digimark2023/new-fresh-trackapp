"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../../utils/firebase"; // Update this import
import {
  signInWithPopup,
  GoogleAuthProvider,
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  displayName: string | null;
  login: (phoneNumber: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setDisplayName(user?.displayName || null);
      if (user && pathname === "/login") {
        router.push("/add-expense");
      }
    });
    return () => unsubscribe();
  }, [router, pathname]);

  const login = async (phoneNumber: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        `${phoneNumber}@example.com`,
        password
      );
      setUser(userCredential.user);
      router.push("/add-expense");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      router.push("/add-expense");
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setDisplayName(null);
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    displayName,
    login,
    googleSignIn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
