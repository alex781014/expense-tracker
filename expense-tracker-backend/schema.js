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
    hello: String
    getTransactions: [Transaction]
  }
`;

module.exports = typeDefs;
