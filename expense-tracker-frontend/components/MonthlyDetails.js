// app/components/MonthlyDetails.js
"use client";

import { useQuery, gql } from "@apollo/client";

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

export default function MonthlyDetails({ month, userId }) {
    console.log("MonthlyDetails props:", { month, userId });  
  const formattedMonth = month.slice(0, 7); // 只取 YYYY-MM 部分

  const { loading, error, data } = useQuery(GET_MONTHLY_TRANSACTIONS, {
    variables: { month: formattedMonth, userId },
    skip: !formattedMonth || !userId,
  });

  if (!month || !userId) return <p>等待月份和用戶資訊...</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { transactions, totalAmount } = data.getMonthlyTransactions;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">月度明細</h2>
      {transactions.length === 0 ? (
        <p>本月尚無交易記錄</p>
      ) : (
        <>
          <ul className="space-y-2">
            {transactions.map(({ id, description, amount, category, date }) => (
              <li key={id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{description}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({category})
                  </span>
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
          <div className="mt-4 text-right">
            <span className="font-bold">總計: ${totalAmount.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  );
}
