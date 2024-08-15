const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserInventory = require("../../Models/UserInventory");
const Item = require("../../Models/Item");
const UserProfile = require("../../Models/UserProfile");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Access your inventory"),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      const userProfile = await UserProfile.findOne({ userId });
      const userInventory = await UserInventory.findOne({ userId }).populate(
        "items.itemId"
      );

      if (!userInventory || userInventory.items.length === 0) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Blurple")
              .setDescription("Your inventory is empty."),
          ],
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`${userProfile.characterName}'s Inventory`);

      const superscriptMap = {
        0: "⁰",
        1: "¹",
        2: "²",
        3: "³",
        4: "⁴",
        5: "⁵",
        6: "⁶",
        7: "⁷",
        8: "⁸",
        9: "⁹",
      };

      userInventory.items.forEach((inventoryItem) => {
        const itemId = inventoryItem.itemId.itemId.toString().padStart(3, "0");
        const itemName = inventoryItem.itemId.name;
        const itemQuantity = inventoryItem.quantity
          .toString()
          .padStart(3, "0")
          .split("")
          .map((num) => superscriptMap[num])
          .join("");

        embed.addFields({
          name: ` \`${itemId}\` ${itemName} ${itemQuantity}`,
          value: `➥ ${inventoryItem.itemId.description}`,
          inline: true,
        });
      });

      return await interaction.reply({
        embeds: [embed],
      });
    } catch (err) {
      console.error("Error fetching inventory:", err);
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("An error occurred while fetching your inventory."),
        ],
        ephemeral: true,
      });
    }
  },
};
