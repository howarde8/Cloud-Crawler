const { gql } = require('apollo-server');

module.exports = gql`
  type Query {
    description: String
    crawls: [Crawl!]
    crawl(id: ID!): Crawl!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
    addCrawl(url: String!, xpath: String!): Crawl!
    updateCrawl(id: ID!, name: String, url: String, xpath: String): Crawl!
    deleteCrawl(id: ID!): Int
  }

  type Subscription {
    crawlUpdated: Crawl
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    username: String!
  }

  type Crawl {
    id: ID!
    name: String
    url: String!
    xpath: String!
    status: String!
    result: String
  }
`;
