const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize('cc-backend', 'root', 'root', {
  host: 'mysql',
  port: '3306',
  dialect: 'mysql',
});

// Require data model
const User = require('./models/User')(sequelize, DataTypes);
const Crawl = require('./models/Crawl')(sequelize, DataTypes);

// Development environment, TODO: production env
(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Sequelize drop and re-sync db');
    await sequelize.authenticate();
    console.log('Sequelize connection has been established successfully');
    const data = await User.create({
      username: 'admin',
      password: await bcrypt.hash('admin', 10),
    });
    console.log('Sequelize create default user "admin" succussful');
  } catch (err) {
    console.log('Sequelize error occurs', err);
  }
})();

module.exports = {
  User,
  Crawl,
};
