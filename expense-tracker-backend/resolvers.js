const admin = require("firebase-admin");

const resolvers = {
  Query: {
    getTransactions: async (_, __, context) => {
      if (!context.user) throw new Error("You must be logged in");
      const snapshot = await admin
        .firestore()
        .collection("transactions")
        .where("userId", "==", context.user.uid)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  },
  Mutation: {
    addTransaction: async (_, args, context) => {
      if (!context.user) throw new Error("You must be logged in");
      const transaction = { ...args, userId: context.user.uid };
      const docRef = await admin
        .firestore()
        .collection("transactions")
        .add(transaction);
      return { id: docRef.id, ...transaction };
    },
    updateTransaction: async (_, { id, ...args }, context) => {
      if (!context.user) throw new Error("You must be logged in");
      const docRef = admin.firestore().collection("transactions").doc(id);
      await docRef.update(args);
      const updatedDoc = await docRef.get();
      return { id, ...updatedDoc.data() };
    },
    deleteTransaction: async (_, { id }, context) => {
      if (!context.user) throw new Error("You must be logged in");
      await admin.firestore().collection("transactions").doc(id).delete();
      return true;
    },
  },
};

module.exports = { resolvers };
