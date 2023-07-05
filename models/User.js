const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  github_username: {
    type: String,
    unique: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
