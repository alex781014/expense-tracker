const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Transaction {
    id: ID!
    amount: Float!
    description: String!
    category: String!
    date: String!
  }

  type Transaction {
    id: ID!
    amount: Float!
    description: String!
    category: String!
    date: String!
  }

  type MonthlyReport {
    transactions: [Transaction!]!
    totalAmount: Float!
  }

  type Query {
    getMonthlyTransactions(month: String!, userId: String!): MonthlyReport!
    getTransactions: [Transaction]
    hello: String
  }

  type Mutation {
    addTransaction(
      userId: String!
      amount: Float!
      description: String!
      category: String!
    ): Transaction!
  }
`;

module.exports = typeDefs;
