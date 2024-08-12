"use client";

import { useState, useCallback } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useMutation, gql } from "@apollo/client";
import TransactionInput from "@/components/TransactionInput";
import MonthlyDetails from "@/components/MonthlyDetails";
import PageLoading from "@/components/PageLoading";

const CREATE_USER = gql`
  mutation CreateUser($id: ID!, $name: String!, $email: String!) {
    createUser(id: $id, name: $name, email: $email) {
      id
      name
      email
    }
  }
`;

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const [createUser] = useMutation(CREATE_USER);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      const { data } = await createUser({
        variables: {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email
        }
      });

      if (data && data.createUser) {
        setUser({
          uid: data.createUser.id,
          email: data.createUser.email,
          displayName: data.createUser.name
        });
      } else {
        throw new Error("Failed to create user");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("登入過程中發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={"553025802653-hk87jcvja9bt4mtreh6am4gh04j4g1he.apps.googleusercontent.com"}>
        <main className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
          <h1 className="text-4xl font-bold mb-5 text-gray-800">消費追蹤器</h1>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => setError("登入失敗")}
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
              userId={user.uid}
              refreshTrigger={refreshKey}
            />
          </div>
        </div>
      </div>
    </main>
  );
}