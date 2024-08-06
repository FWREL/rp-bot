const { Client } = require("discord.js");
const mongoose = require("mongoose");
const mongo = process.env.MONGODB_URL;

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    mongoose.connection.on("connected", () => {
      console.log("Database connection: ✅ Connected");
    });

    await mongoose.connect(mongo, {});

    console.log(`${client.user.username} is now online.`);
  },
};
