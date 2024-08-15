const { model, Schema } = require("mongoose");

const userInventorySchema = new Schema({
  userId: { type: String, required: true },
  items: [
    {
      itemId: { type: Schema.Types.ObjectId, ref: "Item" },
      quantity: { type: Number, default: 0 },
    },
  ],
});

module.exports = model("UserInventory", userInventorySchema);
