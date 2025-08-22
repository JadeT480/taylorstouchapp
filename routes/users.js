const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const { hashPassword, comparePasswords } = require("../helpers/helpers");

/* Register a new user */
router.post("/register", async (req, res) => {
  const { email, password, name, phone, health_notes } = req.body;

  // ensure all required fields are filled out
  if (!email || !password || !name || !phone) {
    return res.status(400).json({ message: "Email, password, name, and phone are required" });
  }

  try {
    // check if a user already exists
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1", 
      [email]
    );
    const user = result.rows[0];

    if (user) {
      return res.status(400).json({
        message: "User already exists",
        next: "/users/login"
      })
    }

    // ensure phone does not already exist
    const phoneCheck = await pool.query(
      "SELECT * FROM users WHERE phone = $1", 
      [phone]);
    if (phoneCheck.rows[0]) {
      return res.status(400).json({ message: "Phone number already is use" });
    }

    // hash the password 
    const password_hash = await hashPassword(password);

    // insert the new user into the db
    const insertNewUser = await pool.query(
      "INSERT INTO users (email, password_hash, name, phone, health_notes) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, email, name, phone, created_at",
      [email, password_hash, name, phone, health_notes || null]
    );
    const newUser = insertNewUser.rows[0];

    console.log("New user created successfully:", newUser);

    res.status(201).json({
      newUser,
      next: "/users/login"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* Login a user */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // check if the user exists
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1", 
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        next: "/users/login"
      })
    }

    // compare the user inputted password with the hashed password
    const passwordMatch = await comparePasswords(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        next: "/users/login"
      })
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        health_notes: user.health_notes,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* Get all users */
router.get("/users", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/* Get a single user */
router.get("/users/:user_id", async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;