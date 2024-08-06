const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check your Ping"),

  async execute(interaction, client) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const ping = client.ws.ping;

    const pingEmbed = new EmbedBuilder()
      .setColor(ping < 200 ? "Green" : ping < 500 ? "Yellow" : "Red")
      .setDescription(`⏳ | The current Websocket Latency is : \`${ping} ms\``);

    return interaction.reply({
      embeds: [pingEmbed],
    });
  },
};
