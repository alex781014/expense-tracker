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
console.log("TypeDefs:", typeDefs);
console.log("Resolvers:", JSON.stringify(resolvers, null, 2));
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization || "";
    try {
      const decodedToken = await admin
        .auth()
        .verifyIdToken(token.replace("Bearer ", ""));
      return { user: decodedToken };
    } catch (error) {
      console.error("Token verification error:", error);
      return { user: null };
    }
  },
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(
      `Server running on http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer();
