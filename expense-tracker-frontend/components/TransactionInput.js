"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";

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
  query GetMonthlyTransactions($month: String!, $userId: String!) {
    getMonthlyTransactions(month: $month, userId: $userId) {
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

export default function TransactionInput({ userId }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [addTransaction] = useMutation(ADD_TRANSACTION, {
    refetchQueries: [
      {
        query: GET_MONTHLY_TRANSACTIONS,
        variables: {
          month: new Date().toISOString().slice(0, 7),
          userId,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTransaction({
        variables: {
          description,
          amount: parseFloat(amount),
          category,
          userId,
        },
      });
      setDescription("");
      setAmount("");
      setCategory("");
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">新增交易</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
