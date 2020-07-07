const { ApolloServer } = require('apollo-server');
const express = require('express');
const bodyParser = require('body-parser');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const pubsub = require('./pubsub');
const db = require('./db');

const tempCrawls = require('./fakeDb');

const app = express();
app.use(bodyParser());
app.post('/api/crawl', (req, res) => {
  res.sendStatus(200);
  console.log(req.body);
  tempCrawls[req.body.id] = { ...tempCrawls[req.body.id], ...req.body };
  pubsub.publish('CRAWL_UPDATED', { crawlUpdated: req.body });
});
app.listen(5000, () => console.log('Express server is listening at port 5000'));

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Apollo server is running at ${url}`);
});
