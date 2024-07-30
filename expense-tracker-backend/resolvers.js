const admin = require("firebase-admin");

const resolvers = {
  Query: {
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
    getMonthlyTransactions: async (_, { startDate, endDate, userId }) => {
      try {
        if (!startDate) {
          const now = new Date();
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split("T")[0];
        }

        const startTimestamp = admin.firestore.Timestamp.fromDate(
          new Date(startDate)
        );
        const endTimestamp = admin.firestore.Timestamp.fromDate(
          new Date(endDate)
        );

        const snapshot = await admin
          .firestore()
          .collection("transactions")
          .where("userId", "==", userId)
          .where("date", ">=", startTimestamp)
          .where("date", "<=", endTimestamp)
          .orderBy("date", "asc")
          .get();

        const transactions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate().toISOString(),
        }));

        const totalAmount = transactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );

        return {
          transactions,
          totalAmount,
        };
      } catch (error) {
        console.error("Error fetching transactions:", error);
        throw new Error("Failed to fetch transactions");
      }
    },
  },
  Mutation: {
    addTransaction: async (_, { userId, amount, description, category }) => {
      try {
        const newTransaction = {
          userId,
          amount,
          description,
          category,
          date: admin.firestore.Timestamp.now(),
        };

        // 檢查是否已存在相同的交易
        const existingTransactions = await admin
          .firestore()
          .collection("transactions")
          .where("userId", "==", userId)
          .where("amount", "==", amount)
          .where("description", "==", description)
          .where("date", "==", newTransaction.date)
          .get();

        if (!existingTransactions.empty) {
          throw new Error("A similar transaction already exists");
        }

        const docRef = await admin
          .firestore()
          .collection("transactions")
          .add(newTransaction);
        return {
          id: docRef.id,
          ...newTransaction,
          date: newTransaction.date.toDate().toISOString(),
        };
      } catch (error) {
        console.error("Error adding transaction:", error);
        throw new Error(error.message || "Failed to add transaction");
      }
    },
  },
};

module.exports = resolvers;
