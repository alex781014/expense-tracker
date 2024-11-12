"use client";

import { useState, useCallback, useEffect } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
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

function LoginButton({ onLoginSuccess, onLoginError }) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setTimeout(() => onLoginSuccess(tokenResponse), 10);
    },
    onError: () => onLoginError()
  });

  return (
    <button
      onClick={() => login()}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150"
    >
      使用 Google 登入
    </button>
  );
}

export default function Home() {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [createUser] = useMutation(CREATE_USER);
  const setUserWithStorage = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
    setUser(userData);
  };
  const handleRefresh = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await userInfoResponse.json();

      const { data } = await createUser({
        variables: {
          id: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email
        }
      });

      if (data && data.createUser) {
        setUserWithStorage({
          uid: data.createUser.id,
          email: data.createUser.email,
          displayName: data.createUser.name,
          accessToken: tokenResponse.access_token
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

  const handleLogout = () => {
    setUserWithStorage(null);
  };
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <main className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
          <h1 className="text-4xl font-bold mb-5 text-gray-800">消費追蹤器</h1>
          <LoginButton
            onLoginSuccess={handleGoogleLoginSuccess}
            onLoginError={() => setError("登入失敗")}
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
            onClick={handleLogout}
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