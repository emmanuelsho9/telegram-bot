const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('school_bridge', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Note: 'false' should not be in quotes
});
module.exports = sequelize;
