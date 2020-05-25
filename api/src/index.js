const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    description: String
  }
`;

const resolvers = {
  Query: {
    description: () => 'This is a cloud crawler system',
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Apollo server is running at ${url}`);
});
