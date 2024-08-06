const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const welcomeSchema = require("../../Models/Welcome");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome-disable")
    .setDescription("Disable welcome message"),

  async execute(interaction) {
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

    try {
      const result = await welcomeSchema.deleteMany({
        Guild: interaction.guild.id,
      });

      if (result.deletedCount === 0) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Blurple")
              .setDescription("There was no welcome system to disable."),
          ],
          ephemeral: true,
        });
      }

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription("The welcome system has been disabled."),
        ],
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error disabling welcome system:", error);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "There was an error while disabling the welcome system."
            ),
        ],
        ephemeral: true,
      });
    }
  },
};
