const jwt = require('jsonwebtoken');
const pubsub = require('./pubsub');
const bcrypt = require('bcryptjs');
const { uuid } = require('uuidv4');
const { User, Crawl } = require('./db');

module.exports = {
  Query: {
    description: () => 'This is a cloud crawler system',
    crawls: () => {
      return Crawl.findAll();
    },
    crawl: (_, { id }) => {
      return Crawl.findByPk(id);
    },
  },
  Mutation: {
    login: async (_, { username, password }) => {
      try {
        const { dataValues: user } = await User.findByPk(username);
        if (await bcrypt.compare(password, user.password)) {
          return {
            token: jwt.sign(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, 'This is secret key'),
            user: {
              username,
            },
          };
        }
      } catch (err) {
        throw Error('Not authenticated', err);
      }
    },
    addCrawl: async (_, { url, xpath }) => {
      const { dataValues: crawl } = await Crawl.create({
        id: uuid(),
        url,
        xpath,
        status: 'STARTING',
      });
      return crawl;
    },
    updateCrawl: async (_, { id, name, url, xpath }) => {
      const res = await Crawl.update({ name, url, xpath }, { where: { id } });
      if (res[0] !== 1) {
        throw Error('Update crawl failed');
      } else {
        return await Crawl.findByPk(id);
      }
    },
    deleteCrawl: async (_, { id }) => {
      const res = await Crawl.destroy({ where: { id } });
      if (res !== 1) {
        throw Error('Delete crawl failed');
      } else {
        return 1;
      }
    },
  },
  Subscription: {
    crawlUpdated: {
      subscribe: () => pubsub.asyncIterator(['CRAWL_UPDATED']),
    },
  },
};
