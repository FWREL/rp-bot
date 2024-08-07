const { EmbedBuilder } = require("discord.js");
const welcomeSchema = require("../../Models/Welcome");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const data = await welcomeSchema.findOne({ Guild: member.guild.id });
    if (!data || !data.WelcomeChannel) return;

    const channel = member.guild.channels.cache.get(data.WelcomeChannel);
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
      .setColor("DarkGreen")
      .setDescription(`Welcome to the server, ${member}!`);

    channel.send({ embeds: [welcomeEmbed] });
  },
};
