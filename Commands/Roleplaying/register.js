const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserProfile = require("../../Models/UserProfile");

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
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const characterName = interaction.options.getString("fullname");
    const dateOfBirthStr = interaction.options.getString("dateofbirth");
    const gender = interaction.options.getString("gender");

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
      });

      await newUserProfile.save();
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `Your character **${characterName}** has been registered with a date of birth *${
                dateOfBirth.toISOString().split("T")[0]
              }*.`
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
