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
      console.log("Received transaction data:", {
        userId,
        amount,
        description,
        category,
      });

      try {
        // 驗證輸入數據
        if (
          !userId ||
          typeof amount !== "number" ||
          !description ||
          !category
        ) {
          console.error("Invalid input data:", {
            userId,
            amount,
            description,
            category,
          });
          throw new Error("Invalid input data");
        }

        const newTransaction = {
          userId,
          amount,
          description,
          category,
          date: admin.firestore.Timestamp.now(),
        };

        console.log("Attempting to check for existing transactions");

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
          console.log("Similar transaction found, throwing error");
          throw new Error("A similar transaction already exists");
        }

        console.log(
          "No similar transaction found, attempting to add new transaction"
        );

        const docRef = await admin
          .firestore()
          .collection("transactions")
          .add(newTransaction);

        console.log("Transaction added successfully. Document ID:", docRef.id);

        return {
          id: docRef.id,
          ...newTransaction,
          date: newTransaction.date.toDate().toISOString(),
        };
      } catch (error) {
        console.error("Error in addTransaction resolver:", error);
        throw new Error(`Failed to add transaction: ${error.message}`);
      }
    },
  },
};

module.exports = resolvers;
