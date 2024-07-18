"use client";

import { useQuery, gql } from "@apollo/client";

const GET_TRANSACTIONS = gql`
  query GetTransactions {
    getTransactions {
      id
      amount
      description
      category
      date
    }
  }
`;

export default function TransactionList() {
  const { loading, error, data } = useQuery(GET_TRANSACTIONS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Transactions</h2>
      <ul>
        {data.getTransactions.map((transaction) => (
          <li key={transaction.id} className="mb-2 p-2 bg-gray-100 rounded">
            <p className="font-semibold">{transaction.description}</p>
            <p>
              ${transaction.amount} - {transaction.category}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
