const express = require("express");
const router = express.Router();
const pool = require("../db");

/* Book a massage */
router.post("/checkout", async (req, res, next) => {
  try {
    const { user_id, massage_id, booking_date, start_time, notes } = req.body;

    if (!user_id || !massage_id || !booking_date || !start_time) {
      return res.status(400).json({ message: "Missing information required" });
    }
    // calculate the end_time
    const massageResult = await pool.query(
      "SELECT duration FROM massages WHERE massage_id = $1",
      [massage_id]
    );

    if (massageResult.rows.length === 0) {
      return res.status(404).json({ error: "Massage not found" });
    }

    const duration = massageResult.rows[0].duration;

    const startDateTime = new Date(`${booking_date}T${start_time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const end_time = endDateTime.toTimeString().split(" ")[0];

    // Add booking to database
    const result = await pool.query(
      `INSERT INTO bookings (user_id, massage_id, booking_date, start_time, end_time, status, notes)
      VALUES ($1, $2, $3, $4, $5, 'scheduled', $6)
      RETURNING *`,
      [user_id, massage_id, booking_date, start_time, end_time, notes || null]
    );

    res.status(201).json({
      message: "Massage successfully booked",
      booking: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;