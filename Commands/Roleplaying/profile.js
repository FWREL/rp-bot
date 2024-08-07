const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserProfile = require("../../Models/UserProfile");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View or edit your character profile")
    .addSubcommand((subcommand) =>
      subcommand.setName("view").setDescription("View your character profile")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit")
        .setDescription("Edit your character profile description")
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("New description for your character")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "edit") {
      const newDescription = interaction.options.getString("description");

      try {
        const userProfile = await UserProfile.findOne({ userId: userId });

        if (!userProfile) {
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription("You haven't registered a character yet."),
            ],
            emphemeral: true,
          });
        }

        userProfile.description = newDescription;
        await userProfile.save();

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Blurple")
              .setDescription("Your character description has been updated."),
          ],
          emphemeral: true,
        });
      } catch (err) {
        console.error(err);
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("An error occurred while updating your profile."),
          ],
          emphemeral: true,
        });
      }
    } else if (subcommand === "view") {
      try {
        const userProfile = await UserProfile.findOne({ userId: userId });

        if (!userProfile) {
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription("You haven't registered a character yet."),
            ],
            emphemeral: true,
          });
        }

        const userAvatarURL = interaction.user.displayAvatarURL({
          format: "png",
          size: 128,
        });

        const embed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle(`${userProfile.characterName}`)
          .setDescription(userProfile.description || "No description provided")
          .addFields(
            {
              name: "Date of Birth",
              value: userProfile.dateOfBirth
                ? userProfile.dateOfBirth.toISOString().split("T")[0]
                : "Not set",
              inline: true,
            },
            {
              name: "Gender",
              value: userProfile.gender,
              inline: true,
            },
            {
              name: "Skills",
              value:
                userProfile.skills.length > 0
                  ? userProfile.skills.join(", ")
                  : "No skills listed",
            }
          )
          .setThumbnail(userAvatarURL)
          .setFooter({
            text: "Identification Card",
          });

        await interaction.reply({ embeds: [embed] });
      } catch (err) {
        console.error(err);
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("An error occurred while fetching your profile."),
          ],
          emphemeral: true,
        });
      }
    }
  },
};
