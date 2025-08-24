require("dotenv").config(); // loads .env variables
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const pool = require("./db");
const usersRouter = require("./routes/users");
const massagesRouter = require("./routes/massages");
const bookingsRouter = require("./routes/bookings");
const swaggerDocument = YAML.load("./swagger.yaml");

const app = express();
app.use(express.json());

const port = 3000;

// API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// mount the user routes
app.use("/users", usersRouter);

// mount the massages routes
app.use("/massages", massagesRouter);

// mount the bookings routes
app.use("/bookings", bookingsRouter);

// homepage route - checks that database is connected
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`Database time: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error connecting to the database");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;