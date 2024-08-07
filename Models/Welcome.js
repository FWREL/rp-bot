const { Schema, model } = require("mongoose");

const welcomeSchema = new Schema({
  Guild: String,
  WelcomeChannel: String,
  FarewellChannel: String,
});

module.exports = model("Welcome", welcomeSchema);
