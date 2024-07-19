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
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Transactions</h2>
      <ul>
        {data.getTransactions.map((transaction) => (
          <li key={transaction.id}>
            {transaction.description} - ${transaction.amount}
            <br />
            {transaction.category} |{" "}
            {new Date(transaction.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;
