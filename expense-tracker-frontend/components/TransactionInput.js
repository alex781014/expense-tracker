"use client";

import { useState } from "react";
import { useMutation, gql, useApolloClient } from "@apollo/client";

const ADD_TRANSACTION = gql`
  mutation AddTransaction(
    $userId: String!
    $amount: Float!
    $description: String!
    $category: String!
  ) {
    addTransaction(
      userId: $userId
      amount: $amount
      description: $description
      category: $category
    ) {
      id
      amount
      description
      category
      date
    }
  }
`;

const GET_MONTHLY_TRANSACTIONS = gql`
  query GetMonthlyTransactions(
    $startDate: String!
    $endDate: String!
    $userId: String!
  ) {
    getMonthlyTransactions(
      startDate: $startDate
      endDate: $endDate
      userId: $userId
    ) {
      transactions {
        id
        description
        amount
        category
        date
      }
      totalAmount
    }
  }
`;

const categories = [
  "娛樂",
  "教育",
  "餐飲",
  "交通",
  "購物",
  "醫療",
  "居家",
  "其他",
];

export default function TransactionInput({ userId, onTransactionAdded }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const client = useApolloClient();

  const [addTransaction] = useMutation(ADD_TRANSACTION, {
    update(cache, { data: { addTransaction } }) {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const { getMonthlyTransactions } = cache.readQuery({
        query: GET_MONTHLY_TRANSACTIONS,
        variables: {
          startDate: startOfMonth.toISOString().split("T")[0],
          endDate: endOfMonth.toISOString().split("T")[0],
          userId,
        },
      }) || { getMonthlyTransactions: { transactions: [], totalAmount: 0 } };

      const updatedTransactions = [
        ...getMonthlyTransactions.transactions,
        addTransaction,
      ];
      const updatedTotalAmount =
        getMonthlyTransactions.totalAmount + addTransaction.amount;

      cache.writeQuery({
        query: GET_MONTHLY_TRANSACTIONS,
        variables: {
          startDate: startOfMonth.toISOString().split("T")[0],
          endDate: endOfMonth.toISOString().split("T")[0],
          userId,
        },
        data: {
          getMonthlyTransactions: {
            transactions: updatedTransactions,
            totalAmount: updatedTotalAmount,
          },
        },
      });
    },
    onCompleted: (data) => {
      console.log("Transaction added successfully:", data);
      setDescription("");
      setAmount("");
      setCategory("");
      onTransactionAdded();
    },
    onError: (error) => {
      console.error("Error in mutation:", error);
      alert(`添加交易失敗: ${error.message}`);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting transaction:", {
        userId,
        amount: parseFloat(amount),
        description,
        category,
      });
      const result = await addTransaction({
        variables: {
          userId,
          amount: parseFloat(amount),
          description,
          category,
        },
      });
      console.log("Mutation result:", result);

      // 強制重新獲取當月交易數據
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      await client.refetchQueries({
        include: [GET_MONTHLY_TRANSACTIONS],
        variables: {
          startDate: startOfMonth.toISOString().split("T")[0],
          endDate: endOfMonth.toISOString().split("T")[0],
          userId,
        },
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  // 返回的 JSX 保持不變
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">新增交易</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 表單字段保持不變 */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            描述
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例如：吃便當"
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            金額
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            分類
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">請選擇分類</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          添加交易
        </button>
      </form>
    </div>
  );
}
