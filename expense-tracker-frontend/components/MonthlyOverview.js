// app/components/MonthlyOverview.js
"use client";

import { useQuery, gql } from "@apollo/client";
import Link from "next/link";

const GET_MONTHLY_TOTALS = gql`
  query GetMonthlyTotals {
    getMonthlyTotals {
      month
      total
    }
  }
`;

export default function MonthlyOverview() {
  const { loading, error, data } = useQuery(GET_MONTHLY_TOTALS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <h2>月度消費總覽</h2>
      <ul>
        {data.getMonthlyTotals.map(({ month, total }) => (
          <li key={month}>
            <Link href={`/monthly-details/${month}`}>
              {month}: ${total.toFixed(2)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
