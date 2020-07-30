const jwt = require('jsonwebtoken');
const pubsub = require('./pubsub');
const bcrypt = require('bcryptjs');
const { uuid } = require('uuidv4');
const axios = require('axios');
const rp = require('request-promise');
const FormData = require('form-data');
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
      const _id = uuid();
      const { dataValues: crawl } = await Crawl.create({
        id: _id,
        url,
        xpath,
        status: 'STARTING',
      });

      const options = {
        method: 'POST',
        url: 'http://crawler:8083/api/crawl/create_job/',
        headers: {},
        formData: {
          id: _id,
          url: url,
          xpath: xpath,
          frequency: '* * 3 * *',
          proxy: '{"IP": "20118088150.host.telemar.net.br", "port": "8080"}',
        },
      };

      try {
        await rp(options);
      } catch (err) {
        console.log(err);
      }
      // const data = new FormData();
      // data.append('id', _id);
      // data.append('url', url);
      // data.append('xpath', xpath);
      // data.append('frequency', '* * 3 * *');
      // data.append('proxy', JSON.stringify({ IP: '20118088150.host.telemar.net.br', port: '8080' }));

      // try {
      //   await axios.post('http://crawler:8083/api/crawl/create_job/', data, { headers: data.getHeaders() });
      // } catch (err) {
      //   console.log(err);
      // }

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
