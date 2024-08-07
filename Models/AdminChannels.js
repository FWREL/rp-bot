const { Schema, model } = require("mongoose");

const channelSchema = new Schema({
  channelId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

module.exports = model("Channel", channelSchema);
