const express = require("express");
const router = express.Router();
const sequelize = require("sequelize");
const { json } = require("body-parser");
const Op = sequelize.Op;

const Movie = require("../models/movie");
const CrewMember = require("../models/crewMember");

//FILTRARE 2 CAMPURI PARINTE
function where(request) {
  const query = {};
  const filtersRequired = ["title", "publishDate"];
  const filterKeys = Object.keys(request.query).filter(
    (f) => filtersRequired.indexOf(f) !== -1
  );
  if (filterKeys.length > 0) {
    query.where = {};
    for (let key of filterKeys) {
      key === "title"
        ? (query.where[key] = {
            [Op.startsWith]: `${request.query[key]}%`,
          })
        : (query.where[key] = {
            [Op.between]: [
              moment(
                `${request.query[key].split(",")[0]}`,
                "YYYY-MM-DD"
              ).format(),
              moment(
                `${request.query[key].split(",")[1]}`,
                "YYYY-MM-DD"
              ).format(),
            ],
          });
    }
  }
  return query;
}
//SORTARE
function order(request) {
  return request.headers["x-sort"].split(",").reduce((sort, field) => {
    sort.push([field.substring(1), field.charAt(0) === "+" ? "ASC" : "DESC"]);
    return sort;
  }, []);
}
//1.GET
router.get("/movies", async (request, response) => {
  try {
    //FILTRARE, SORTARE, PAGINARE
    let query = {};
    query = where(request);
    if (request.headers["x-sort"]) {
      query.order = order(request);
    }
    let pageSize = 2;
    if (request.query.pageSize) {
      pageSize = parseInt(request.query.pageSize);
    }
    if (!isNaN(parseInt(request.query.pageSize))) {
      query.limit = pageSize;
      query.offset = pageSize * parseInt(request.query.page);
    }
    const records = await Movie.findAll(query);
    const count = await Movie.count();
    if (records.length > 0) {
      response.status(200).json(records);
    } else {
      response.status(204).send();
    }
  } catch (error) {
    console.warn(error);
    return response.status(500), json(error);
  }
});

//2.POST
router.post("/movies", async (request, response) => {
  if (!request.body.title) {
    return response.send("No title!");
  }
  if (!request.body.publishDate) {
    return response.send("No date!");
  }

  try {
    let record = await Movie.create(request.body);
    response
      .status(200)
      .location(
        `http://${request.headers.host}${request.baseUrl}${request.url}/${record.id}`
      )
      .json(record);
  } catch (error) {
    response.status(500).json(error);
  }
});

//3 GET by ID
router.get("/movies/:id", async (request, response) => {
  try {
    if (request.params.id) {
      const record = await Movie.findByPk(request.params.id, {
        include: CrewMember,
      });
      if (record) {
        response.status(200).json(record);
      } else {
        response.status(404).json("Object with this id does not exist!");
      }
    } else {
      response.status(400).send();
    }
  } catch (error) {
    response.status(500).json(error);
  }
});

//4.PUT
router.put("/movies/:id", async (request, response) => {
  if (!request.body.title) {
    return response.send("No title!");
  }
  if (!request.body.publishDate) {
    return response.send("No date!");
  }

  const object = await Movie.findByPk(request.params.id);
  if (object) {
    return response.status(200).json(await object.update(request.body));
  } else {
    return response
      .status(404)
      .json({ error: `Obiectul cu id ${request.params.id} nu exista!` });
  }
});

//5. DEELETE
router.delete("/movies/:id", async (request, response) => {
  const record = await Movie.findByPk(request.params.id);
  if (record) {
    return response.status(200).json(await record.destroy());
  } else {
    return response
      .status(404)
      .json({ error: `Obiectul cu id ${request.params.id} nu exista!` });
  }
});

//1. POST child
router.post("/movies/:id/crewmembers", async (request, response) => {
  try {
    const record = await Movie.findByPk(request.params.id);
    if (record) {
      const crewmember = request.body;
      crewmember.movieId = record.id;
      console.warn(crewmember);
      await CrewMember.create(crewmember);
      response
        .status(200)
        .location(
          `http://${request.headers.host}${request.baseUrl}${request.url}/${crewmember.id}`
        )
        .json(crewmember);
    } else {
      response.status(404).json({ message: "Not found!" });
    }
  } catch (error) {
    //console.warn(error);
    response.status(500).json({ error: "Server error!" });
  }
});

//2. GET all childs
router.get("/movies/:id/crewmembers", async (request, response) => {
  try {
    const record = await Movie.findByPk(request.params.id);
    if (record) {
      const crewmember = await record.getCrewMembers();
      response.status(200).json(crewmember);
    } else {
      response.status(404).json({ message: "Not found!" });
    }
  } catch (error) {
    response.status(500).json({ error: "Server error!" });
  }
});

//3. GET a child from a parent
router.get("/movies/:mId/crewmembers/:cId", async (request, response) => {
  try {
    const record = await Movie.findByPk(request.params.mId);
    if (record) {
      const crewmembers = await record.getCrewMembers({
        where: { id: request.params.cId },
      });
      response.status(200).json(crewmembers.shift());
    } else {
      response.status(404).json({ message: "Not found!" });
    }
  } catch (error) {
    response.status(500).json({ error: "Server error!" });
  }
});

// 4. GET all crewmembers
router.get("/crewmembers", async (request, response) => {
  try {
    const records = await CrewMember.findAll();
    if (records.length > 0) {
      response.status(200).json(records);
    } else {
      response.status(204).send();
    }
  } catch (error) {
    return response.status(500), json(error);
  }
});

//5. PUT child
router.put("/movies/:mId/crewmembers/:cId", async (request, response) => {
  try {
    const record = await Movie.findByPk(request.params.mId);
    if (record) {
      const crewmembers = await record.getCrewMembers({
        where: { id: request.params.cId },
      });
      const crewmember = crewmembers.shift();
      if (crewmember) {
        await crewmember.update(request.body);
        response.status(200).json(crewmember);
      } else {
        response.status(404).json({ message: "Not found!" });
      }
    } else {
      response.status(404).json({ message: "Not found!" });
    }
  } catch (error) {
    response.status(500).json({ error: "Server error!" });
  }
});

//6. DELETE child

router.delete("/movies/:mId/crewmembers/:cId", async (request, response) => {
  try {
    const record = await Movie.findByPk(request.params.mId);
    if (record) {
      const crewmembers = await record.getCrewMembers({
        where: { id: request.params.cId },
      });
      const crewmember = crewmembers.shift();
      if (crewmember) {
        await crewmember.destroy(request.body);
        response.status(200).json(crewmember);
      } else {
        response.status(404).json({ message: "Not found!" });
      }
    } else {
      response.status(404).json({ message: "Not found!" });
    }
  } catch (error) {
    response.status(500).json({ error: "Server error!" });
  }
});
module.exports = router;
