const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserProfile = require("../../Models/UserProfile");
const AdminChannel = require("../../Models/AdminChannels");

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
        )
        .addStringOption((option) =>
          option
            .setName("profile_picture")
            .setDescription("New profile picture for your character")
        )
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "edit") {
      const newDescription = interaction.options.getString("description");
      const newProfilePicture =
        interaction.options.getString("profile_picture");

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

        if (newDescription) {
          userProfile.description = newDescription;
        }

        if (newProfilePicture) {
          userProfile.profilePicture = newProfilePicture;
        }

        await userProfile.save();

        // Log Admin
        const adminChannel = await AdminChannel.findOne({
          name: "registerLog",
        });
        const registerLogChannel = adminChannel
          ? interaction.client.channels.cache.get(adminChannel.channelId)
          : null;

        if (registerLogChannel) {
          const editLogEmbed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("Character Profile Edited")
            .setDescription("A character profile has been edited.")
            .addFields(
              {
                name: "Character Name",
                value: userProfile.characterName,
                inline: true,
              },
              {
                name: "Date of Birth",
                value: userProfile.dateOfBirth.toLocaleDateString(),
                inline: true,
              },
              { name: "Gender", value: userProfile.gender, inline: true },
              {
                name: "Description",
                value: newDescription || userProfile.description,
              },
              {
                name: "Profile Picture",
                value: newProfilePicture || userProfile.profilePicture,
              }
            )
            .setThumbnail(
              newProfilePicture ||
                userProfile.profilePicture ||
                "https://via.placeholder.com/100"
            )
            .setTimestamp()
            .setFooter({
              text: `Server: ${interaction.guild.name}`,
              iconURL: interaction.guild.iconURL(),
            });

          registerLogChannel.send({ embeds: [editLogEmbed] });
        }

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Blurple")
              .setDescription("Your character profile has been updated."),
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

        const embed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle(`${userProfile.characterName}`)
          .setDescription(userProfile.description || "No description provided")
          .addFields(
            {
              name: "Date of Birth",
              value: userProfile.dateOfBirth.toLocaleDateString() || "N/A",
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
                  : "No skills learned",
            }
          )
          .setThumbnail(
            userProfile.profilePicture || "https://via.placeholder.com/100"
          )
          .setFooter({
            text: `Identification Card | ${interaction.guild.name}`,
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
