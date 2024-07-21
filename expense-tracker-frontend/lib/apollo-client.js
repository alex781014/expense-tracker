import { getAuth, getIdToken } from "firebase/auth";
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "http://localhost:4005/graphql",
});

const authLink = setContext(async (_, { headers }) => {
  const auth = getAuth();
  if (auth.currentUser) {
    try {
      const token = await getIdToken(auth.currentUser, true);
      console.log("Sending token:", token.substring(0, 10) + "...");
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
  console.log("No current user, not sending token");
  return { headers };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
