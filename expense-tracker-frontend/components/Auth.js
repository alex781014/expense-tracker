"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { useApolloClient } from "@apollo/client";
import { auth } from "../lib/firebase";

export default function Auth() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const client = useApolloClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Sign in successful:", result.user);
      await client.resetStore();
      router.refresh();
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      await client.resetStore();
      router.refresh();
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <div className="mb-4">
      {user ? (
        <button
          onClick={logOut}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      ) : (
        <button
          onClick={signIn}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sign In with Google
        </button>
      )}
    </div>
  );
}
