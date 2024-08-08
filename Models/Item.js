const { model, Schema } = require("mongoose");

const itemSchema = new Schema({
  itemId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageURL: { type: String },
  value: { type: Number, default: 0 },
});

module.exports = model("Item", itemSchema);
