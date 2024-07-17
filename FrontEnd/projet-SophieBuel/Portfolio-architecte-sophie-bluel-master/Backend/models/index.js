const dbConfig = require('./../config/db.config.js');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  database: 'project6-db',
  username: 'user',
  password: 'pass',
  ...dbConfig
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./users.model.js')(sequelize, DataTypes);
db.works = require('./works.model.js')(sequelize, DataTypes);
db.categories = require('./categories.model.js')(sequelize, DataTypes);

// Works and Categories Relationships
db.categories.hasMany(db.works, { as: "works" });
db.works.belongsTo(db.categories, {
  foreignKey: 'categoryId',
  as: 'category'
});

// Works and Users Relationships
db.users.hasMany(db.works, { as: "works" });
db.works.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = db;