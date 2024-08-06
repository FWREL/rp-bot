const {
  Client,
  MessageComponentInteraction,
  InteractionType,
  EmbedBuilder,
} = require("discord.js");
const DB = require("../../Models/Verify");

module.exports = {
  name: "interactionCreate",

  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */

  async execute(interaction, client) {
    const { guild, customId, member, type } = interaction;

    if (type !== InteractionType.MessageComponent) return;

    const CustomId = ["verify"];
    if (!CustomId.includes(customId)) return;

    const Data = await DB.findOne({ Guild: guild.id }).catch((err) => {});

    const embed1 = new EmbedBuilder()
      .setDescription(`❌ | Couldn't find any data!`)
      .setColor("DarkRed");

    if (!Data)
      return await interaction.reply({ embeds: [embed1], ephemeral: true });

    const Role = guild.roles.cache.get(Data.Role);

    const embed2 = new EmbedBuilder()
      .setDescription(`❌ | You already verified!`)
      .setColor("DarkRed");

    if (member.roles.cache.has(Role.id))
      return await interaction.reply({ embeds: [embed2], ephemeral: true });
    await member.roles.add(Role);

    const embed3 = new EmbedBuilder()
      .setDescription(`✅ | You have been verified!`)
      .setColor("Green");

    await interaction.reply({ embeds: [embed3], ephemeral: true });
  },
};
