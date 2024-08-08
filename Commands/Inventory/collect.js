const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserInventory = require("../../Models/UserInventory");
const Item = require("../../Models/Item");
const AdminChannels = require("../../Models/AdminChannels");
const UserProfile = require("../../Models/UserProfile");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("collect")
    .setDescription("Collect an Item")
    .addStringOption((option) =>
      option
        .setName("item_name")
        .setDescription("The name of the item you want to collect")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const itemName = interaction.options.getString("item_name");

    try {
      const item = await itemName.findOne({ name: itemName });

      if (!item) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("Item not found."),
          ],
          ephemeral: true,
        });
      }

      let userInventory = await UserInventory.findOne({ userId });

      if (!userInventory) {
        userInventory = new UserInventory({ userId, items: [] });
      }

      const itemIndex = userInventory.items.findIndex(
        (i) => i.itemId.toString() === item._id.toString()
      );

      if (itemIndex > -1) {
        userInventory.items[itemIndex].quantity += 1;
      } else {
        userInventory.items.push({ itemId: item._id, quantity: 1 });
      }

      await userInventory.save();

      // Create a log for someone collecting item
      const adminChannel = await AdminChannels.findOne({
        name: "itemLog",
      });
      const collectLogChannel = adminChannel
        ? interaction.client.channels.cache.get(adminChannel.channelId)
        : null;

      if (collectLogChannel) {
        const collectLogEmbed = new EmbedBuilder()
          .setColor("DarkGreen")
          .setTitle(`${UserProfile.characterName}'s Collected`)
          .setDescription(`User has been collect a **${item.name}**`)
          .setTimestamp()
          .setFooter({
            text: `${interaction.guild.name} | Edited by: ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        collectLogChannel.send({ embeds: [collectLogEmbed] });
      }

      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`You have collected a **${item.name}**`),
        ],
        ephemeral: true,
      });
    } catch (err) {
      console.error(err);
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("An error occured while collecting the item."),
        ],
        ephemeral: true,
      });
    }
  },
};
