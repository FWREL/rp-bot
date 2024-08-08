const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserInventory = require("../../Models/UserInventory");
const Item = require("../../Models/Item");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Access your inventory"),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      const userInventory = await UserInventory.findOne({ userId }).populate(
        "items.itemId"
      );

      if (!userInventory || userInventory.items.length === 0) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Blurple")
              .setDescription("Your inventory is empty"),
          ],
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`${interaction.user.username}'s Inventory`);

      userInventory.items.forEach((inventoryItem) => {
        embed.addFields({
          name: `${inventoryItem.itemId.name} (ID: ${inventoryItem.itemId.itemId})`,
          value: `Quantity: ${inventoryItem.quantity}\nDescription: ${inventoryItem.itemId.description}`,
          inline: true,
        });
      });

      return await interaction.reply({
        embeds: [embed],
      });
    } catch (err) {
      console.error(err);
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("An error occured while fetching your inventory."),
        ],
        ephemeral: true,
      });
    }
  },
};
