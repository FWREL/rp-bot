const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const welcomeSchema = require("../../Models/Welcome");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome-setup")
    .setDescription("Setup the welcome and farewell system")
    .addChannelOption((option) =>
      option
        .setName("welcome-channel")
        .setDescription("The channel where the welcome message will be sent")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("farewell-channel")
        .setDescription("The channel where the farewell message will be sent")
        .setRequired(true)
    ),

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

    const welcomeChannel = interaction.options.getChannel("welcome-channel");
    const farewellChannel = interaction.options.getChannel("farewell-channel");

    try {
      let data = await welcomeSchema.findOne({ Guild: interaction.guild.id });

      if (data) {
        await welcomeSchema.updateOne(
          { Guild: interaction.guild.id },
          {
            WelcomeChannel: welcomeChannel.id,
            FarewellChannel: farewellChannel.id,
          }
        );
      } else {
        await welcomeSchema.create({
          Guild: interaction.guild.id,
          WelcomeChannel: welcomeChannel.id,
          FarewellChannel: farewellChannel.id,
        });
      }

      await interaction.reply({
        content: `The welcome system has been set up in ${welcomeChannel} and the farewell system has been set up in ${farewellChannel}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content:
          "There was an error while setting up the welcome and farewell system.",
        ephemeral: true,
      });
    }
  },
};
