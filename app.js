require("dotenv").config(); // loads .env variables
const express = require("express");
const pool = require("./db");
const usersRouter = require("./routes/users");
const massagesRouter = require("./routes/massages");

const app = express();
app.use(express.json());

const port = 3000;

// mount the user routes
app.use("/users", usersRouter);

// mount the massages routes
app.use("/massages", massagesRouter);

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