const express = require("express");
const router = express.Router();
const pool = require("../db");

/* Get all massages available */
router.get("/massages", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM massages");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/* Get a single massage */
router.get("/massages/:massage_id", async (req, res, next) => {
  try {
    const { massage_id } = req.params;
    const result = await pool.query(
      "SELECT * FROM massages WHERE massage_id = $1",
      [massage_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Massage not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;