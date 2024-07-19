const resolvers = {
  Query: {
    getTransactions: async (_, __, context) => {
      console.log("getTransactions called, context:", context);
      if (!context.user) {
        console.log("No user in context");
        throw new Error("You must be logged in");
      }

      try {
        const snapshot = await admin
          .firestore()
          .collection("transactions")
          .where("userId", "==", context.user.uid)
          .get();

        console.log(`Found ${snapshot.docs.length} transactions`);

        return snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Transaction data:", data);
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate().toISOString(),
          };
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
        throw new Error("Failed to fetch transactions");
      }
    },
  },
};
