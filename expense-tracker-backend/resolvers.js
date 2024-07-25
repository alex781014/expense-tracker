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
    getMonthlyTransactions: async (_, { month, userId }) => {
      console.log("Received query:", { month, userId });

      // 解析輸入的月份
      const [year, monthNum] = month.split("-").map(Number);

      // 創建該月的開始和結束時間戳
      const startOfMonth = admin.firestore.Timestamp.fromDate(
        new Date(year, monthNum - 1, 1)
      );
      const endOfMonth = admin.firestore.Timestamp.fromDate(
        new Date(year, monthNum, 0, 23, 59, 59, 999)
      );

      console.log("Date range:", {
        startOfMonth: startOfMonth.toDate().toISOString(),
        endOfMonth: endOfMonth.toDate().toISOString(),
      });

      try {
        const snapshot = await admin
          .firestore()
          .collection("transactions")
          .where("userId", "==", userId)
          .where("date", ">=", startOfMonth)
          .where("date", "<=", endOfMonth)
          .get();

        console.log(`Found ${snapshot.docs.length} transactions`);

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
        category,
        date: admin.firestore.Timestamp.now(),
      };

      try {
        const docRef = await admin
          .firestore()
          .collection("transactions")
          .add(transactionData);

        console.log(`Added new transaction with ID: ${docRef.id}`);

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
