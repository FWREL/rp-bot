const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Channel = require("../../Models/AdminChannels");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adminchannel")
    .setDescription("Manage admin channels")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Action to perform (set, get)")
        .setRequired(true)
        .addChoices(
          { name: "Set Channel", value: "set" },
          { name: "Get Channel", value: "get" }
        )
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to set")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name to assign to the channel")
        .setRequired(false)
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
    const channel = interaction.options.getChannel("channel");
    const name = interaction.options.getString("name");

    try {
      if (action === "set") {
        if (!channel || !name) {
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription(
                  "You must provide both the channel and the name."
                ),
            ],
          });
        }

        // Check if the channel already exists
        const existingChannel = await Channel.findOne({
          channelId: channel.id,
        });
        if (existingChannel) {
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription("This channel is already registered."),
            ],
          });
        }

        // Register the new channel
        const newChannel = new Channel({
          channelId: channel.id,
          name,
        });

        await newChannel.save();

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setDescription(
                `Channel ${channel.name} (${channel.id}) has been registered with name "${name}".`
              ),
          ],
        });
      }

      if (action === "get") {
        const channels = await Channel.find();

        if (channels.length === 0) {
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription("No channels are registered."),
            ],
          });
        }

        const embed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle("Registered Channels")
          .addFields(
            channels.map((ch) => ({
              name: `Channel ${ch.name}`,
              value: `ID: ${ch.channelId}`,
            }))
          );

        return await interaction.reply({ embeds: [embed] });
      }
    } catch (err) {
      console.error(err);
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("An error occurred while managing channels."),
        ],
      });
    }
  },
};
