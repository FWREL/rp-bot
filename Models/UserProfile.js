const { model, Schema } = require("mongoose");

const userProfileSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  characterName: { type: String, required: true },
  dateOfBirth: { type: Date, default: null },
  description: { type: String, default: null },
  skills: { type: [String], default: [] },
  gender: { type: String, enum: ["Male", "Female"], required: true },
});

module.exports = model("UserProfile", userProfileSchema);
