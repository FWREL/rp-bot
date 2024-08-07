const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserProfile = require("../../Models/UserProfile");
const AdminChannel = require("../../Models/AdminChannels");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adminaccount")
    .setDescription("Manage user profiles")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Action to perform (view, delete)")
        .setRequired(true)
        .addChoices(
          { name: "View Profile", value: "view" },
          { name: "Edit Profile", value: "edit" },
          { name: "Delete Profile", value: "delete" }
        )
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User whose profile to manage")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("description").setDescription("Description of the user")
    )
    .addStringOption((option) =>
      option
        .setName("profile_picture")
        .setDescription("Profile Picture of the user")
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for editing the user")
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
    const newDescription = interaction.options.getString("description");
    const newProfilePicture = interaction.options.getString("profile_picture");
    const reason = interaction.options.getString("reason");

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
            text: `${interaction.user.username} | ${interaction.guild.name}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        return await interaction.reply({ embeds: [embed] });
      }

      if (action === "edit") {
        if (!newDescription) {
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription("Description is required for editing."),
            ],
            ephemeral: true,
          });
        }

        if (!reason) {
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription("Reason is required for editing"),
            ],
            ephemeral: true,
          });
        }

        // Edit profile
        userProfile.description = newDescription;
        if (newProfilePicture) {
          userProfile.profilePicture = newProfilePicture;
        }
        await userProfile.save();

        // Log the profile edit
        const adminChannel = await AdminChannel.findOne({
          name: "registerLog",
        });
        const registerLogChannel = adminChannel
          ? interaction.client.channels.cache.get(adminChannel.channelId)
          : null;

        if (registerLogChannel) {
          const editLogEmbed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle(`Character Profile Edited by Admin`)
            .setDescription(
              `A character profile has been edited by ${interaction.user.tag}.`
            )
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
              { name: "Description", value: newDescription },
              {
                name: "Profile Picture",
                value: newProfilePicture || userProfile.profilePicture,
              },
              { name: "Reason", value: reason }
            )
            .setThumbnail(
              newProfilePicture ||
                userProfile.profilePicture ||
                "https://via.placeholder.com/100"
            )
            .setTimestamp()
            .setFooter({
              text: `${interaction.guild.name} | Edited by: ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          registerLogChannel.send({ embeds: [editLogEmbed] });
        }

        // Notify the user via DM
        const userDmEmbed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle("Your Character Profile has been Edited")
          .setDescription(`Your character profile has been edited by an admin.`)
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
            { name: "New Description", value: newDescription },
            {
              name: "New Profile Picture",
              value: newProfilePicture || userProfile.profilePicture,
            },
            { name: "Reason", value: reason }
          )
          .setThumbnail(
            newProfilePicture ||
              userProfile.profilePicture ||
              "https://via.placeholder.com/100"
          )
          .setTimestamp()
          .setFooter({
            text: `${interaction.guild.name} | Edited by: ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        try {
          await user.send({ embeds: [userDmEmbed] });
        } catch (err) {
          console.error(`Could not send DM to user ${user.tag}: ${err}`);
        }

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Blurple")
              .setDescription("User profile has been updated successfully."),
          ],
          ephemeral: true,
        });
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
