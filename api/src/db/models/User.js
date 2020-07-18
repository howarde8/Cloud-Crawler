module.exports = (sequelize, DataTypes) =>
  sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING,
    },
  });
