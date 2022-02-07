const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./sqlite/movies.db",
  define: {
    timestamps: false,
  },
});

sequelize
  .sync()
  .then(() => {
    console.log("All models were syncronized successfully");
  })
  .catch((e) => console.log(e));

module.exports = sequelize;
