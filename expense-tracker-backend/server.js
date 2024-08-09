const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const admin = require("firebase-admin");
const cors = require("cors");
const { OAuth2Client } = require('google-auth-library');
require("dotenv").config();

const app = express();
app.use(cors({
  origin: ['https://expense-tracker-cc7b.vercel.app', 'http://localhost:3000', 'https://studio.apollographql.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return null;
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return { user: null };
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
      // 首先嘗試驗證 Google token
      const googleUser = await verifyGoogleToken(idToken);
      if (googleUser) {
        return { user: googleUser };
      }

      // 如果 Google 驗證失敗，嘗試 Firebase 驗證
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return { user: decodedToken };
    } catch (error) {
      console.error('Authentication error:', error);
      return { user: null };
    }
  },
  playground: true,
  introspection: true,
  cors: false
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/', cors: false });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();