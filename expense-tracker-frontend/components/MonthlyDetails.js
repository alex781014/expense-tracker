"use client";

import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import DatePicker from "./DatePicker";

const GET_TRANSACTIONS_BY_DATE_RANGE = gql`
  query GetTransactionsByDateRange(
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

export default function MonthlyDetails({ userId }) {
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("detailed");

  // 獲取當月第一天的
  function getFirstDayOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const { loading, error, data, refetch } = useQuery(
    GET_TRANSACTIONS_BY_DATE_RANGE,
    {
      variables: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        userId,
      },
      skip: !userId,
    }
  );

  // 當日期改變時重新獲取數據
  useEffect(() => {
    if (userId) {
      refetch({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        userId,
      });
    }
  }, [startDate, endDate, userId, refetch]);

  if (!userId) return <p>等待用戶資訊...</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { transactions, totalAmount } = data.getMonthlyTransactions;

  // 計算類別金額
  const categorySummary = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = { total: 0, count: 0 };
    }
    acc[transaction.category].total += transaction.amount;
    acc[transaction.category].count += 1;
    return acc;
  }, {});

  const renderDetailedView = () => (
    <ul className="space-y-2">
      {transactions.map(({ id, description, amount, category, date }) => (
        <li key={id} className="flex justify-between items-center">
          <div>
            <span className="font-medium">{description}</span>
            <span className="text-sm text-gray-500 ml-2">({category})</span>
          </div>
          <div>
            <span className="font-semibold">${amount.toFixed(2)}</span>
            <span className="text-sm text-gray-500 ml-2">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );

  const renderCategorizedView = () => (
    <ul className="space-y-2">
      {Object.entries(categorySummary).map(([category, { total, count }]) => (
        <li key={category} className="flex justify-between items-center">
          <div>
            <span className="font-medium">{category}</span>
            <span className="text-sm text-gray-500 ml-2">({count} 筆交易)</span>
          </div>
          <span className="font-semibold">${total.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">交易明細</h2>
      <div className="mb-4 flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            開始日期
          </label>
          <DatePicker
            selectedDate={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            結束日期
          </label>
          <DatePicker
            selectedDate={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
          />
        </div>
      </div>
      <div className="mb-4">
        <button
          onClick={() => setViewMode("detailed")}
          className={`mr-2 px-4 py-2 rounded ${
            viewMode === "detailed" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          詳細明細
        </button>
        <button
          onClick={() => setViewMode("categorized")}
          className={`px-4 py-2 rounded ${
            viewMode === "categorized"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          分類明細
        </button>
      </div>
      {transactions.length === 0 ? (
        <p>該時間段內尚無交易記錄</p>
      ) : (
        <>
          {viewMode === "detailed"
            ? renderDetailedView()
            : renderCategorizedView()}
          <div className="mt-4 text-right">
            <span className="font-bold">總計: ${totalAmount.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  );
}
