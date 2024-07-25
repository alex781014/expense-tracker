const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const admin = require("firebase-admin");    
const cors = require("cors");
require("dotenv").config();
var serviceAccount = require("./expense-tracker-445d0-firebase-adminsdk-8vlqn-b8e5b36017.json");
const app = express();
app.use(cors());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // console.log("Context function called");
    const authHeader = req.headers.authorization || "";
    // console.log("Auth header:", authHeader);

    if (!authHeader.startsWith("Bearer ")) {
    //   console.log("Invalid auth header format");
      return { user: null };
    }

    const idToken = authHeader.split("Bearer ")[1];
    // console.log("Extracted token:", idToken.substring(0, 10) + "...");

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
    //   console.log("Token verified successfully. User ID:", decodedToken.uid);
      return { user: decodedToken };
    } catch (error) {
    //   console.error("Token verification error:", error.code, error.message);
      return { user: null };
    }
  },
  playground: true,
  introspection: true,
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT 
  app.listen(PORT, () => {
    console.log(
      `Server running on http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer();
