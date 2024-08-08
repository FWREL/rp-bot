const { model, Schema } = require("mongoose");

const userInventorySchema = new Schema({
  userId: { type: String, required: true },
  items: [
    {
      itemId: { type: Schema.Types.ObjectId, ref: "item" },
      quantity: { type: Number, default: 1 },
    },
  ],
});

module.exports = model("UserInventory", userInventorySchema);
