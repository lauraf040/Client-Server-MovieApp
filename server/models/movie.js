const { DataTypes } = require("sequelize");
const sequelize = require("../seq.js");

const Movie = sequelize.define(
  "movie",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [3, 100],
        },
      },
    },
    category: {
      type: DataTypes.ENUM,
      values: ["ACTION", "COMEDY", "THRILLER", "HORROR", "ANIMATION"],
    },
    publishDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { tableName: "Movies" }
);

module.exports = Movie;
