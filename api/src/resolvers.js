const jwt = require('jsonwebtoken');

module.exports = {
  Query: {
    description: () => 'This is a cloud crawler system',
  },
  Mutation: {
    login: (_, { username, password }) => {
      // TODO: to be modified
      if (username === 'admin' && password === 'admin') {
        return {
          token: jwt.sign(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, 'This is secret key'),
          user: {
            username: 'admin',
          },
        };
      }

      throw Error('Not authenticated');
    },
  },
};
