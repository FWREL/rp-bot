const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const welcomeSchema = require("../../Models/Welcome");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome-disable")
    .setDescription("Disable the welcome and farewell system"),

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
          content: "There was no welcome or farewell system to disable.",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `The welcome and farewell system has been disabled.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error disabling welcome and farewell system:", error);
      await interaction.reply({
        content:
          "There was an error while disabling the welcome and farewell system.",
        ephemeral: true,
      });
    }
  },
};
