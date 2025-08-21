const bcrypt = require("bcrypt");
const saltRounds = 10;

// hash a plain-text password whilst registering
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (err) {
    console.log(err);
    return null;
  }
};

// compare the hashed password and user inputted password when logging in
const comparePasswords = async (password, password_hash) => {
  try {
    return await bcrypt.compare(password, password_hash);
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = { hashPassword, comparePasswords };