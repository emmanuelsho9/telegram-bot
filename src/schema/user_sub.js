const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');



    const Subscription = sequelize.define('subscription', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull:false
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
            },
      price: {
        type:DataTypes.STRING
      },
      daysLeft: {
        type:DataTypes.INTEGER
      },
      startDate: {
        type:DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Set the default value to the current date and time

      },
      endDate: {
        type:DataTypes.DATE
      },
  },{
    timestamps: true,
    tableName: "subscriptions",
  });
  
  module.exports = Subscription;