const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

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
    getUser(id: ID!): User
    getUserTransactions(userId: ID!, startDate: String, endDate: String): MonthlyReportResult!
  }

  type Mutation {
    createUser(id: ID!, name: String!, email: String!): User!
    addTransaction(
      userId: ID!
      amount: Float!
      description: String!
      category: String
    ): Transaction!
  }
`;

module.exports = typeDefs;
