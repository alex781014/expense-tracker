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

function TransactionList() {
  const { loading, error, data } = useQuery(GET_TRANSACTIONS);
  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error("Apollo error:", error);
    return <p>Error: {error.message}</p>;
  }

  if (!data || !data.getTransactions) {
    return <p>No transactions found</p>;
  }

  return (
    <ul>
      {data.getTransactions.map((transaction) => (
        <li key={transaction.id}>
          {transaction.description} - ${transaction.amount}
        </li>
      ))}
    </ul>
  );
}

export default TransactionList;
