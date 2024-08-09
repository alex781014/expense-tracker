const admin = require("firebase-admin");

const resolvers = {
  Query: {
    getUser: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Authentication required");
      }
      const userId = context.user.sub;
      const userDoc = await admin.firestore().collection("users").doc(userId).get();
      if (!userDoc.exists) {
        throw new Error("User not found");
      }
      return { id: userDoc.id, ...userDoc.data() };
    },
    getUserTransactions: async (_, { startDate, endDate }, context) => {
      if (!context.user) {
        throw new Error("Authentication required");
      }
      const userId = context.user.sub;
      try {
        const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(startDate));
        const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(endDate + 'T23:59:59.999Z'));

        const snapshot = await admin
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("transactions")
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
    createUser: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Authentication required");
      }
      const { sub: id, name, email } = context.user;
      try {
        const userRef = admin.firestore().collection("users").doc(id);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          return { id, ...userDoc.data() };
        }

        const userData = { name, email };
        await userRef.set(userData);

        return { id, ...userData };
      } catch (error) {
        console.error("Error in createUser resolver:", error);
        throw new Error(`Failed to create user: ${error.message}`);
      }
    },
    addTransaction: async (_, { amount, description, category }, context) => {
      if (!context.user) {
        throw new Error("Authentication required");
      }
      const userId = context.user.sub;
      try {
        const userRef = admin.firestore().collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          throw new Error("User not found. Please create the user first.");
        }

        const newTransaction = {
          amount,
          description,
          category,
          date: admin.firestore.Timestamp.now(),
        };

        const docRef = await userRef.collection("transactions").add(newTransaction);

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