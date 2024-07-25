import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

import { setContext } from "@apollo/client/link/context";
import { getAuth, getIdToken } from "firebase/auth";

const httpLink = createHttpLink({
  uri: "http://localhost:4005/graphql", // 確保這是正確的後端 URL
});

const authLink = setContext(async (_, { headers }) => {
  const auth = getAuth();
  if (auth.currentUser) {
    try {
      const token = await getIdToken(auth.currentUser, true);
      console.log("Token being sent:", token); // 添加這行來檢查發送的 token
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
        },
      };
    } catch (error) {
      console.error("Error getting token:", error);
    }
  }
  return { headers };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
