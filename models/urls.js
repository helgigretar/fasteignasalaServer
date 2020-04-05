'use strict';
module.exports = (sequelize, DataTypes) => {
  const urls = sequelize.define('urls', {
    urls: DataTypes.STRING,
    shortUrl: DataTypes.STRING
  }, {});
  urls.associate = function(models) {
    // associations can be defined here
  };
  return urls;
};