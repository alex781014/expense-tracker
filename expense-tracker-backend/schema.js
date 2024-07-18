const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Transaction {
    id: ID!
    amount: Float!
    description: String!
    category: String!
    date: String!
  }

  type Query {
    getTransactions: [Transaction!]!
  }

  type Mutation {
    addTransaction(
      amount: Float!
      description: String!
      category: String!
      date: String!
    ): Transaction!
    updateTransaction(
      id: ID!
      amount: Float
      description: String
      category: String
      date: String
    ): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
