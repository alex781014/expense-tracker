const admin = require("firebase-admin");

const resolvers = {
  Query: {
    hello: () => {
      return "Hello, World!";
    },
    getTransactions: async (_, __, context) => {
      if (!context.user) {
        throw new Error("You must be logged in");
      }

      const snapshot = await admin.firestore().collection("transactions").get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    getMonthlyTransactions: async (_, { month, userId }) => {
      const [year, monthNum] = month.split("-").map(Number);

      const startOfMonth = admin.firestore.Timestamp.fromDate(
        new Date(year, monthNum - 1, 1)
      );
      const endOfMonth = admin.firestore.Timestamp.fromDate(
        new Date(year, monthNum, 0, 23, 59, 59, 999)
      );
      try {
        const snapshot = await admin
          .firestore()
          .collection("transactions")
          .where("userId", "==", userId)
          .where("date", ">=", startOfMonth)
          .where("date", "<=", endOfMonth)
          .get();

        const transactions = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate().toISOString(),
          };
        });

        return {
          transactions,
          totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
        };
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return { transactions: [], totalAmount: 0 };
      }
    },
  },
  Mutation: {
    addTransaction: async (_, { userId, amount, description, category }) => {
      const transactionData = {
        userId,
        amount,
        description,
        category: category || null,
        date: admin.firestore.Timestamp.now(),
      };

      try {
        const docRef = await admin
          .firestore()
          .collection("transactions")
          .add(transactionData);

        return {
          id: docRef.id,
          ...transactionData,
          date: transactionData.date.toDate().toISOString(),
        };
      } catch (error) {
        console.error("Error adding transaction:", error);
        throw new Error("Failed to add transaction");
      }
    },
  },
};

module.exports = resolvers;
