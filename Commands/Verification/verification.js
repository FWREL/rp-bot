const {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
} = require("discord.js");

const DB = require("../../Models/Verify");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Inbuild Verification System")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Select the verified members role")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select where the panel will be sent to")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Custom title for the verification panel")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Custom description for the verification panel")
        .setRequired(false)
    ),

  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */

  async execute(interaction, client) {
    console.log("Executing verify command");
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)
    )
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "You don't have a permission to run this command. `Permission needed: ManageGuild`"
            ),
        ],
        ephemeral: true,
      });

    const { options, guild, channel } = interaction;

    const role = options.getRole("role");
    const VerChannel = options.getChannel("channel") || channel;
    const customTitle =
      options.getString("title") || "👩🏻‍✈️ | Verification Passport";
    const customDescription =
      options.getString("description") ||
      "Please verify your Passport and get access to this city!";

    let Data = await DB.findOne({ Guild: guild.id }).catch((err) => {});

    if (!Data) {
      Data = new DB({
        Guild: guild.id,
        Role: role.id,
      });

      await Data.save();
    } else {
      Data.Role = role.id;
      await Data.save();
    }

    VerChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("DarkGreen")
          .setTitle(customTitle)
          .setDescription(customDescription)
          .setThumbnail("https://i.giphy.com/i7qq3cswmCxnhFTk0m.gif"),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("verify")
            .setLabel("Verify!")
            .setStyle(ButtonStyle.Success)
        ),
      ],
    });

    const embed1 = new EmbedBuilder()
      .setDescription(
        `✅ | Successfully sent verification panel in ${VerChannel}`
      )
      .setColor("Green");

    return await interaction.reply({ embeds: [embed1], ephemeral: true });
  },
};
