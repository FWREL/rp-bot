const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserProfile = require("../../Models/UserProfile");
const AdminChannel = require("../../Models/AdminChannels");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register a new character")
    .addStringOption((option) =>
      option
        .setName("fullname")
        .setDescription("The full name of your character")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("dateofbirth")
        .setDescription("The date of birth in DD-MM-YYYY format")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("gender")
        .setDescription("The gender of your character")
        .setRequired(true)
        .addChoices(
          { name: "Male", value: "Male" },
          { name: "Female", value: "Female" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("profilepicture")
        .setDescription("URL of your character's profile picture")
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const characterName = interaction.options.getString("fullname");
    const dateOfBirthStr = interaction.options.getString("dateofbirth");
    const gender = interaction.options.getString("gender");
    const profilePicture = interaction.options.getString("profilepicture");

    if (!dateOfBirthStr) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("Date of birth is required."),
        ],
        emphemeral: true,
      });
    }

    // Convert dateOfBirth from DD-MM-YYYY to Date object
    const [day, month, year] = dateOfBirthStr
      .split("-")
      .map((num) => parseInt(num, 10));
    const dateOfBirth = new Date(year, month - 1, day); // months are 0-based

    if (isNaN(dateOfBirth.getTime())) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "Please provide a valid date in DD-MM-YYYY format."
            ),
        ],
        emphemeral: true,
      });
    }

    try {
      const existingProfile = await UserProfile.findOne({ userId });

      if (existingProfile) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Blurple")
              .setDescription("You already have a registered character."),
          ],
          emphemeral: true,
        });
      }

      // Create a new user profile
      const newUserProfile = new UserProfile({
        userId,
        characterName,
        dateOfBirth,
        gender,
        profilePicture: profilePicture || "https://via.placeholder.com/100",
      });

      await newUserProfile.save();

      // Create a log for new user
      const adminChannel = await AdminChannel.findOne({ name: "registerLog" });
      const registerLogChannel = adminChannel
        ? interaction.client.channels.cache.get(adminChannel.channelId)
        : null;

      if (registerLogChannel) {
        const registerLogEmbed = new EmbedBuilder()
          .setColor("DarkGreen")
          .setTitle("New Character Registered")
          .setDescription("A new character has been registered.")
          .addFields(
            { name: "Character Name", value: characterName, inline: true },
            {
              name: "Date of Birth",
              value: dateOfBirth.toLocaleDateString(),
              inline: true,
            },
            { name: "Gender", value: gender, inline: true }
          )
          .setThumbnail(profilePicture || "https://via.placeholder.com/100")
          .setTimestamp()
          .setFooter({
            text: `${interaction.user.username} | ${interaction.guild.name}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        registerLogChannel.send({ embeds: [registerLogEmbed] });
      }

      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `Your character **${characterName}** has been registered.`
            ),
        ],
        emphemeral: true,
      });
    } catch (err) {
      console.error(err);
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "An error occurred while registering your character."
            ),
        ],
        emphemeral: true,
      });
    }
  },
};
