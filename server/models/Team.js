const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: String,
  captain: String,
  purse: Number,
  userId: String
});

module.exports = mongoose.model("Team", teamSchema);
