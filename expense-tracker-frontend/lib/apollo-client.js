import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

import { setContext } from "@apollo/client/link/context";
import { getAuth, getIdToken } from "firebase/auth";

const httpLink = createHttpLink({
  uri: "http://localhost:4005/graphql", // 確保這是正確的後端 URL
});

const authLink = setContext(async (_, { headers }) => {
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
