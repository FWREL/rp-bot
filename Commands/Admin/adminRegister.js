const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserProfile = require("../../Models/UserProfile");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adminregister")
    .setDescription("Manage user profiles")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Action to perform (view, delete)")
        .setRequired(true)
        .addChoices(
          { name: "View Profile", value: "view" },
          { name: "Delete Profile", value: "delete" }
        )
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User whose profile to manage")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Check if the user has the "Administrator" Role
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("You don't have permissions to use this command."),
        ],
        ephemeral: true,
      });
    }

    const action = interaction.options.getString("action");
    const user = interaction.options.getUser("user");

    try {
      const userProfile = await UserProfile.findOne({ userId: user.id });

      if (!userProfile) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("User profile not found."),
          ],
        });
      }

      if (action === "view") {
        // View profile
        const embed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle(`${userProfile.characterName}'s Profile`)
          .addFields(
            {
              name: "Description",
              value: userProfile.description || "No description",
            },
            {
              name: "Date of Birth",
              value: userProfile.dateOfBirth.toDateString() || "N/A",
            },
            { name: "Gender", value: userProfile.gender || "Not specified" },
            {
              name: "Skills",
              value: userProfile.skills.join(", ") || "No skills learned",
            }
          )
          .setThumbnail(
            userProfile.profilePicture || "https://via.placeholder.com/100"
          )
          .setFooter({
            text: `${interaction.guild.name} | Managed by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        return await interaction.reply({ embeds: [embed] });
      }

      if (action === "delete") {
        // Delete profile
        await UserProfile.deleteOne({ userId: user.id });

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setDescription("User profile deleted successfully."),
          ],
        });
      }
    } catch (err) {
      console.error(err);
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "An error occurred while managing the user profile."
            ),
        ],
      });
    }
  },
};
