"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, gql } from "@apollo/client";
import DatePicker from "./DatePicker";
import { formatISO } from 'date-fns';

const GET_USER_TRANSACTIONS = gql`
  query GetUserTransactions($userId: ID!, $startDate: String!, $endDate: String!) {
    getUserTransactions(userId: $userId, startDate: $startDate, endDate: $endDate) {
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

export default function MonthlyDetails({ userId, refreshTrigger = 0 }) {
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("detailed");
  const [selectedCategory, setSelectedCategory] = useState(null);

  function getFirstDayOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const formatDate = (date) => {
    return formatISO(date, { representation: 'date' });
  };

  const { loading, error, data, refetch } = useQuery(GET_USER_TRANSACTIONS, {
    variables: {
      userId,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
    skip: !userId,
    fetchPolicy: "network-only",
  });

  const handleDateChange = useCallback((start, end) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  useEffect(() => {
    if (userId) {
      refetch({
        userId,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });
    }
  }, [startDate, endDate, userId, refetch, refreshTrigger]);

  if (!userId) return <p>等待用戶資訊...</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { transactions, totalAmount } = data.getUserTransactions;

  const categorySummary = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = { total: 0, count: 0, transactions: [] };
    }
    acc[transaction.category].total += transaction.amount;
    acc[transaction.category].count += 1;
    acc[transaction.category].transactions.push(transaction);
    return acc;
  }, {});

  const renderDetailedView = () => (
    <ul className="space-y-2">
      {transactions.map(({ id, description, amount, category, date }) => (
        <li key={id} className="flex justify-between items-center">
          <div>
            <span className="font-medium text-gray-500">{description}</span>
            <span className="text-sm text-gray-500 ml-2">({category})</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500">${amount}</span>
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
            <span className="font-medium text-gray-500">{category}</span>
            <span className="text-sm text-gray-500 ml-2">({count} 筆交易)</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500">${total}</span>
            <button
              onClick={() => {
                setSelectedCategory(category);
                setViewMode("categoryDetail");
              }}
              className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-sm"
            >
              詳細
            </button>
          </div>
        </li>
      ))}
    </ul>
  );

  const renderCategoryDetailView = () => {
    if (!selectedCategory) return null;
    const categoryData = categorySummary[selectedCategory];
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-500">
          {selectedCategory}類別明細
        </h3>

        <ul className="space-y-2">
          {categoryData.transactions.map(
            ({ id, description, amount, date }) => (
              <li key={id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-500">{description}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">${amount}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(date).toLocaleDateString()}
                  </span>
                </div>
              </li>
            )
          )}
        </ul>
        <p className="my-2 text-center font-bold text-gray-500">
          {selectedCategory}消費總計: ${categoryData.total} (
          {categoryData.count} 筆交易)
        </p>
        <button
          onClick={() => setViewMode("categorized")}
          className="mt-4 px-4 py-2 bg-gray-200 rounded"
        >
          返回分類明細
        </button>
      </div>
    );
  };

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
            onChange={(date) => handleDateChange(date, endDate)}
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
            onChange={(date) => handleDateChange(startDate, date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            maxDate={new Date()}
          />
        </div>
      </div>
      <div className="mb-4">
        <button
          onClick={() => setViewMode("detailed")}
          className={`mr-2 px-4 py-2 rounded ${viewMode === "detailed" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
        >
          詳細明細
        </button>
        <button
          onClick={() => setViewMode("categorized")}
          className={`px-4 py-2 rounded ${viewMode === "categorized"
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
          {viewMode === "detailed" && renderDetailedView()}
          {viewMode === "categorized" && renderCategorizedView()}
          {viewMode === "categoryDetail" && renderCategoryDetailView()}
          <div className="mt-4 text-right">
            <span className="font-bold text-gray-500">
              消費總計為: ${totalAmount}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
