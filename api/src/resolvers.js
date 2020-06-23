const { PubSub } = require('apollo-server');
const jwt = require('jsonwebtoken');

const pubsub = new PubSub();

let idCnt = 0;
const tempCrawls = {};

module.exports = {
  Query: {
    description: () => 'This is a cloud crawler system',
    crawls: () => {
      return Object.values(tempCrawls);
    },
    crawl: (_, { id }) => {
      return tempCrawls[id];
    },
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
    addCrawl: (_, { url, xpath }) => {
      let currentId = idCnt;
      tempCrawls[currentId] = {
        id: currentId,
        url,
        xpath,
        status: 'IN PROGRESS',
        result: [],
      };
      idCnt += 1;
      return tempCrawls[currentId];
    },
    fakeUpdateCrawl: (_, { id, result }) => {
      tempCrawls[id].result = result;
      tempCrawls[id].status = 'CRAWLED'
      pubsub.publish('CRAWL_UPDATED', { crawlUpdated: tempCrawls[id] });
    },
  },
  Subscription: {
    crawlUpdated: {
      subscribe: () => pubsub.asyncIterator(['CRAWL_UPDATED']),
    },
  },
};
