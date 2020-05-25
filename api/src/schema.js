const { gql } = require('apollo-server');

module.exports = gql`
  type Query {
    description: String
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    username: String!
  }
`;
