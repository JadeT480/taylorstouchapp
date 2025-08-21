const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const { hashPassword, comparePasswords } = require("../helpers/helpers");

/* Register a new user */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

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
    };

    // hash the password 
    const password_hash = await hashPassword(password);

    // insert the new user into the db
    const insertNewUser = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING user_id, email, created_at",
      [email, password_hash]
    );
    const newUser = insertNewUser.rows[0];

    console.log("New user created successfully:", newUser);

    res.status(201).json({
      newUser,
      next: "/users/login"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({message: "Internal server error"});
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
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({message: "Internal server error"});
  }
});

module.exports = router;