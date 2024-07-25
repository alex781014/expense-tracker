// app/components/TransactionInput.js
"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";

const ADD_TRANSACTION = gql`
  mutation AddTransaction(
    $description: String!
    $amount: Float!
    $userId: String!
  ) {
    addTransaction(
      description: $description
      amount: $amount
      userId: $userId
    ) {
      id
      description
      amount
      date
    }
  }
`;

export default function TransactionInput({ userId }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [addTransaction] = useMutation(ADD_TRANSACTION);

  const handleSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      variables: {
        description,
        amount: parseFloat(amount),
        userId,
      },
    });
    setDescription("");
    setAmount("");
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
