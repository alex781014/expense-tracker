"use client";

import { useState, useCallback } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import TransactionInput from "@/components/TransactionInput";
import MonthlyDetails from "@/components/MonthlyDetails";
import PageLoading from "@/components/PageLoading";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  const handleGoogleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log(decoded)
    setUser({
      uid: decoded.sub,
      email: decoded.email,
      displayName: decoded.name
    });
  };

  if (loading) {
    return <PageLoading />;
  }

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={"553025802653-hk87jcvja9bt4mtreh6am4gh04j4g1he.apps.googleusercontent.com"}>
        <main className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
          <h1 className="text-4xl font-bold mb-5 text-gray-800">消費追蹤器</h1>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => console.log('Login Failed')}
          />
        </main>
      </GoogleOAuthProvider>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-6 flex flex-col items-center sm:py-12">
      <div className="w-full max-w-4xl px-4 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">消費追蹤器</h1>
          <button
            onClick={() => setUser(null)}
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
            />
          </div>
        </div>
      </div>
    </main>
  );
}