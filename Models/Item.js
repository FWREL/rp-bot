const { model, Schema } = require("mongoose");
const UserInventory = require("./UserInventory");

const itemSchema = new Schema({
  itemId: { type: Number, required: true, unique: true },
  icon: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageURL: { type: String, default: null },
  value: { type: Number, default: 0 },
});

itemSchema.pre("remove", async function (next) {
  try {
    await UserInventory.updateMany(
      { "items.itemId": this._id },
      { $pull: { items: { itemId: this._id } } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = model("Item", itemSchema);
