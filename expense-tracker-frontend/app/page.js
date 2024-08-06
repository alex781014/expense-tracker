"use client";

import { useState, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import TransactionInput from "@/components/TransactionInput";
import MonthlyDetails from "@/components/MonthlyDetails";
import PageLoading from "@/components/PageLoading";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  if (loading) {
    return <PageLoading />;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold mb-5 text-gray-800">消費追蹤器</h1>
        <button
          onClick={signInWithGoogle}
          className="px-4 py-2 border flex gap-2 border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150"
        >
          <img
            className="w-6 h-6"
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            loading="lazy"
            alt="google logo"
          />
          <span>使用Google登入</span>
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-6 flex flex-col items-center sm:py-12">
      <div className="w-full max-w-4xl px-4 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">消費追蹤器</h1>
          <button
            onClick={() => signOut(auth)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150"
          >
            登出
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <TransactionInput
              userId={user.uid}
              onTransactionAdded={handleRefresh}
            />
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <MonthlyDetails
              month={selectedMonth}
              userId={user.uid}
              refreshTrigger={refreshKey}
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
