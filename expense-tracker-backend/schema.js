const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Transaction {
    id: ID!
    amount: Float!
    description: String!
    category: String
    date: String!
  }

  type MonthlyReportResult {
    transactions: [Transaction!]!
    totalAmount: Float!
  }

  type Query {
    getMonthlyTransactions(
      startDate: String
      endDate: String!
      userId: String!
    ): MonthlyReportResult!
    getTransactions: [Transaction]
  }

  type Mutation {
    addTransaction(
      userId: String!
      amount: Float!
      description: String!
      category: String
    ): Transaction!
  }
`;

module.exports = typeDefs;
