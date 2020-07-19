const { ApolloServer } = require('apollo-server');
const express = require('express');
const bodyParser = require('body-parser');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const pubsub = require('./pubsub');
const { Crawl } = require('./db');

const app = express();
app.use(bodyParser());
app.post('/api/crawl', async (req, res) => {
  const { id, status, body } = req.body;
  if (!id) {
    return res.status(400).send('ID is missing');
  }
  if (!status) {
    return res.status(400).send('Status not found');
  } else if (status !== 'FAILED' && status !== 'SUCCESS') {
    return res.status(400).send('Status invalid, should be FAILED or SUCCESS');
  }
  if (body) {
    try {
      JSON.parse(body);
    } catch (err) {
      return res.status(400).send('Body invalud, must be JSON array format');
    }
  }

  const data = await Crawl.update({ status, result: body }, { where: { id } });
  if (data[0] !== 1) {
    return res.status(500).send('ID not found');
  }
  const crawl = await Crawl.findByPk(id);
  pubsub.publish('CRAWL_UPDATED', { crawlUpdated: crawl });
  res.sendStatus(200);
});

app.listen(5000, () => console.log('Express server is listening at port 5000'));

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Apollo server is running at ${url}`);
});
