module.exports = (sequelize, DataTypes) =>
  sequelize.define('crawl', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    xpath: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    result: {
      type: DataTypes.TEXT,
    },
  });
