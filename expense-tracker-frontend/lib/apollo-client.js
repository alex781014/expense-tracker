import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

import { setContext } from "@apollo/client/link/context";
import { getAuth, getIdToken } from "firebase/auth";

const httpLink = createHttpLink({
  uri: "https://expense-tracker-backend-frtr3vsb6q-de.a.run.app",
});

const authLink = setContext(async (_, { headers }) => {
  const auth = getAuth();
  if (auth.currentUser) {
    try {
      const token = await getIdToken(auth.currentUser, true);
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
