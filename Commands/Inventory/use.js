const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserInventory = require("../../Models/UserInventory");
const Item = require("../../Models/Item");
const AdminChannels = require("../../Models/AdminChannels");
const UserProfile = require("../../Models/UserProfile");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Use an item from your inventory")
    .addIntegerOption((option) =>
      option
        .setName("item_id")
        .setDescription("The ID of the item to use")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const itemId = interaction.options.getInteger("item_id");

    try {
      const item = await Item.findOne({ itemId });

      if (!item) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("Item not found."),
          ],
          emphemeral: true,
        });
      }

      const userInventory = await UserInventory.findOne({ userId });

      if (!userInventory) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("red")
              .setDescription("Your inventory is empty."),
          ],
          emphemeral: true,
        });
      }

      const inventoryItem = userInventory.items.find(
        (i) => i.itemId.toString() === item._id.toString()
      );

      if (!inventoryItem || inventoryItem.quantity <= 0) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("You don't have that item in your inventory."),
          ],
          ephemeral: true,
        });
      }

      inventoryItem.quantity -= 1;
      if (inventoryItem.quantity === 0) {
        userInventory.items = userInventory.items.filter(
          (i) => i.itemId.toString() !== item._id.toString()
        );
      }

      await userInventory.save();

      // Create a log for someone use item
      const adminChannel = await AdminChannels.findOne({
        name: "itemLog",
      });
      const useLogChannel = adminChannel
        ? interaction.client.channels.cache.get(adminChannel.channelId)
        : null;

      if (useLogChannel) {
        const useLogEmbed = new EmbedBuilder()
          .setColor("DarkGreen")
          .setTitle(`${UserProfile.characterName}'s used`)
          .setDescription(`User has been used a **${item.name}**`)
          .setTimestamp()
          .setFooter({
            text: `${interaction.guild.name} | Edited by: ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        useLogChannel.send({ embeds: [useLogEmbed] });
      }

      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`You have used a **${item.name}**.`),
        ],
        emphemeral: true,
      });
    } catch (err) {
      console.error(err);
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("An error occurred while using the item."),
        ],
        emphemeral: true,
      });
    }
  },
};
