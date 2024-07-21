const admin = require("firebase-admin");

const resolvers = {
  Query: {
    hello: () => {
      console.log("Hello resolver called");
      return "Hello, World!";
    },
    getTransactions: async (_, __, context) => {
      console.log("getTransactions resolver called");

      if (!context.user) {
        console.log("No authenticated user");
        throw new Error("You must be logged in");
      }

      // 使用 context.user.uid 從 Firestore 獲取數據
      const snapshot = await admin
        .firestore()
        .collection("transactions")
        // .where("userId", "==", context.user.uid)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
  },
};

module.exports = resolvers;
