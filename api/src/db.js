const { Sequelize, DataTypes } = require('sequelize');

const db = new Sequelize('cc-backend', 'root', 'root', {
  host: 'mysql',
  port: '3306',
  dialect: 'mysql',
});

db.authenticate().then(
  () => {
    console.log('Connection has been established successfully.');
  },
  (err) => {
    console.log('Unable to connect to the database:', err);
  }
);
