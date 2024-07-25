const admin = require("firebase-admin");
const serviceAccount = require("./expense-tracker-445d0-firebase-adminsdk-8vlqn-b8e5b36017.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const transactions = [
  {
    userId: "vYnrIGIezgbKSGLMGjz2HAWMiTz1",
    amount: 150.5,
    description: "超市購物",
    category: "食品",
    date: admin.firestore.Timestamp.fromDate(new Date("2023-07-05")),
  },
  {
    userId: "vYnrIGIezgbKSGLMGjz2HAWMiTz1",
    amount: 80.0,
    description: "午餐",
    category: "餐飲",
    date: admin.firestore.Timestamp.fromDate(new Date("2023-07-10")),
  },
  {
    userId: "vYnrIGIezgbKSGLMGjz2HAWMiTz1",
    amount: 200.0,
    description: "電影票",
    category: "娛樂",
    date: admin.firestore.Timestamp.fromDate(new Date("2023-07-15")),
  },
  {
    userId: "vYnrIGIezgbKSGLMGjz2HAWMiTz1",
    amount: 350.0,
    description: "書籍",
    category: "教育",
    date: admin.firestore.Timestamp.fromDate(new Date("2023-07-20")),
  },
  {
    userId: "vYnrIGIezgbKSGLMGjz2HAWMiTz1",
    amount: 450.0,
    description: "晚餐",
    category: "餐飲",
    date: admin.firestore.Timestamp.fromDate(new Date("2023-08-05")),
  },
];

async function addTransactions() {
  for (let transaction of transactions) {
    await db.collection("transactions").add(transaction);
  }
  console.log("All transactions added successfully");
}

addTransactions().then(() => process.exit());
