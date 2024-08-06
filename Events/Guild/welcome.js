const { Client, GuildMember, EmbedBuilder } = require("discord.js");
const DB = require("../../Models/Welcome");
const { execute } = require("../../Commands/Moderation/welcomeSetup");

module.exports = {
  name: "guildMemberAdd",

  /**
   * @param {guildMember} member
   * @param {Client} client
   */

  async execute(member, client) {
    const { user, guild } = member;

    const data = await DB.findOne({ Guild: guild.id }).catch((err) => {});
    if (!data) return;

    if (data.Channel !== null) {
      const Channel = guild.channels.cache.get(data.Channel);
      if (!Channel) return;

      const embed = new EmbedBuilder()
        .setColor("DarkGreen")
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .setDescription(
          `
                AYO WHAT'S GOOD?! 
                \n Supp SIIRRR!, welcome aboard to HYPEABIS! 💯 
                \n ▬ Verify your account to access the server. ✅・verify 
                \n ▬ Please take a few seconds to introduce your awesome-self here: ​​​​​​​​✅・registration 
                \n ▬ Check out our "Rules & Manual Guide" of the server here: ​​​​​​​​✅・registration ​​🧭・guide 
                \n ▬ Assign yourself a few roles to finalize your arrival here: ​​​​​​​​#👑・roles 
                \n If there's any questions or any personal role request, feel free to send our @Staff a message and you will be assisted shortly. Cheers! :cdg:
                `
        )
        .setThumbnail(
          "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWtjNjNqdHAweDR0ZDV4bnl5eXVkNDdmeW5uanVya21zbzllamxhdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H2k97d0rtu0QRksaEr/giphy.gif"
        )
        .setFooter({ text: "Welcome by me" })
        .setTimestamp();

      Channel.send({ embeds: [embed] });
    }
  },
};
