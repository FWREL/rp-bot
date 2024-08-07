const { EmbedBuilder } = require("discord.js");
const welcomeSchema = require("../../Models/Welcome");

module.exports = {
  name: "guildMemberRemove",
  async execute(member) {
    const data = await welcomeSchema.findOne({ Guild: member.guild.id });
    if (!data || !data.FarewellChannel) return;

    const channel = member.guild.channels.cache.get(data.FarewellChannel);
    if (!channel) return;

    const farewellEmbed = new EmbedBuilder()
      .setColor("DarkRed")
      .setDescription(`${member.user.tag} has left the server.`);

    channel.send({ embeds: [farewellEmbed] });
  },
};
