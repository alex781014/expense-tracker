// app/monthly-details/[month]/page.js
"use client";

import { useParams } from "next/navigation";
import { useQuery, gql } from "@apollo/client";

const GET_MONTHLY_TRANSACTIONS = gql`
  query GetMonthlyTransactions($month: String!) {
    getMonthlyTransactions(month: $month) {
      id
      description
      amount
      date
    }
  }
`;

export default function MonthlyDetails() {
  const params = useParams();
  const { month } = params;
  const { loading, error, data } = useQuery(GET_MONTHLY_TRANSACTIONS, {
    variables: { month },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <h2>{month} 消費詳情</h2>
      <ul>
        {data.getMonthlyTransactions.map(
          ({ id, description, amount, date }) => (
            <li key={id}>
              {description}: ${amount.toFixed(2)} -{" "}
              {new Date(date).toLocaleDateString()}
            </li>
          )
        )}
      </ul>
    </div>
  );
}
