const express = require("express");
const sequelize = require("./seq");
const cors = require("cors");
const router = require("./routes/routes");
const app = express();

const Movie = require("./models/movie");
const CrewMember = require("./models/crewMember");
Movie.hasMany(CrewMember, { foreignKey: "movieId" });
CrewMember.belongsTo(Movie, { foreignKey: "movieId" });

app.use(cors());
app.use(express.json());
app.use("/api", router);

app.listen(8080, async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully");
  } catch (error) {
    console.error(error);
  }
});
