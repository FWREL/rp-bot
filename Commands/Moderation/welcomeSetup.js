const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const welcomeSchema = require("../../Models/Welcome");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome-setup")
    .setDescription("Setup the welcome system")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where the welcome message will be sent")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageChannels
      )
    ) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "You don't have permission to run this command. `Permission Needed: ManageChannels`"
            ),
        ],
        ephemeral: true,
      });
    }

    const channel = interaction.options.getChannel("channel");

    try {
      const data = await welcomeSchema.findOne({ Guild: interaction.guild.id });

      if (data) {
        return await interaction.reply({
          content:
            "You already have a welcome message system in place. To restart it, use the `/welcome-disable` command.",
          ephemeral: true,
        });
      }

      await welcomeSchema.create({
        Guild: interaction.guild.id,
        Channel: channel.id,
      });

      await interaction.reply({
        content: `The welcome system has been enabled within the ${channel}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while setting up the welcome system.",
        ephemeral: true,
      });
    }
  },
};
