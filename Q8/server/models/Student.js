const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Student = sequelize.define('Student', {
  rollNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  course: {
    type: DataTypes.STRING,
    defaultValue: 'Computer Engineering'
  },
  semester: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  cpi: {
    type: DataTypes.FLOAT,
    defaultValue: 8.0
  }
}, {
  timestamps: true
});

module.exports = Student;
