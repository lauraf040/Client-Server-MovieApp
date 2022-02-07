const { DataTypes } = require("sequelize");
const sequelize = require("../seq");

const CrewMember = sequelize.define(
  "crewMember",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [5, 50],
        },
      },
    },
    role: {
      type: DataTypes.ENUM,
      values: ["DIRECTOR", "WRITER", "PRODUCER", "ACTOR"],
    },
  },
  { tableName: "CrewMembers" }
);

module.exports = CrewMember;
