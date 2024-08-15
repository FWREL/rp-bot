const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserInventory = require("../../Models/UserInventory");
const Item = require("../../Models/Item");
const AdminChannels = require("../../Models/AdminChannels");
const UserProfile = require("../../Models/UserProfile");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admininventory")
    .setDescription("Manage user inventories")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Action to perform (add, remove, view)")
        .setRequired(true)
        .addChoices(
          { name: "Add Item", value: "add" },
          { name: "Remove Item", value: "remove" },
          { name: "View Inventory", value: "view" }
        )
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User whose inventory to manage")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("itemid").setDescription("The ID of the item")
    )
    .addIntegerOption((option) =>
      option.setName("quantity").setDescription("Quantity of the item")
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
    const itemId = interaction.options.getInteger("itemid");
    const quantity = interaction.options.getInteger("quantity") || 1;

    try {
      let userProfile = await UserInventory.findOne({ userId: user.id });
      const userProfileData = await UserProfile.findOne({ userId: user.id });

      if (action === "view") {
        // View inventory
        if (!userProfile || userProfile.items.length === 0) {
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription("The user's inventory is empty."),
            ],
            emphemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle(`${userProfileData.characterName}'s Inventory`);

        userProfile.items.forEach((inventoryItem) => {
          embed.addFields({
            name: `${inventoryItem.itemId.name} (ID: ${inventoryItem.itemId.itemId})`,
            value: `Quantity: ${inventoryItem.quantity}\nDescription: ${inventoryItem.itemId.description}`,
            inline: true,
          });
        });

        return await interaction.reply({ embeds: [embed] });
      }

      if (!itemId) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("Item ID is required for this action."),
          ],
          emphemeral: true,
        });
      }

      const item = await Item.findOne({ itemId });

      if (!item) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("Item not found."),
          ],
          emphemeral: true,
        });
      }

      if (action === "add") {
        // Add item to inventory
        if (!userProfile) {
          userProfile = new UserInventory({ userId: user.id, items: [] });
        }

        const itemIndex = userProfile.items.findIndex(
          (i) => i.itemId.toString() === item._id.toString()
        );

        if (itemIndex > -1) {
          userProfile.items[itemIndex].quantity += quantity;
        } else {
          userProfile.items.push({ itemId: item._id, quantity });
        }

        await userProfile.save();

        // Log adding item
        const adminChannel = await AdminChannels.findOne({
          name: "itemLog",
        });
        const addLogChannel = adminChannel
          ? interaction.client.channels.cache.get(adminChannel.channelId)
          : null;

        if (addLogChannel) {
          const addLogEmbed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("Adding item to user by Admin")
            .setDescription(
              `An item has been added by ${interaction.user.tag}.`
            )
            .addFields(
              {
                name: `Quantity: `,
                value: `\`${quantity}\``,
                inline: true,
              },
              {
                name: "Item: ",
                value: `\`${item.name}\``,
                inline: true,
              },
              {
                name: "To: ",
                value: `\`${userProfileData.characterName}\``,
              }
            )
            .setTimestamp()
            .setFooter({
              text: `${interaction.guild.name} | Added by: ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          addLogChannel.send({ embeds: [addLogEmbed] });
        }

        // Notify the user via DM
        const addDmEmbed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle("Added items to your inventory by Admin")
          .setDescription(
            `Added **${quantity}** of **${item.name}** to ${user.username}'s inventory.`
          )
          .setTimestamp()
          .setFooter({
            text: `${interaction.guild.name} | Added by: ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        try {
          await user.send({ embeds: [addDmEmbed] });
        } catch (err) {
          console.error(`Could not send DM to user ${user.tag}: ${err}`);
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription(`The user can't be notifed on DMs!`),
            ],
          });
        }

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setDescription(
                `Added **${quantity}** of **${item.name}** to ${user.username}'s inventory.`
              ),
          ],
          emphemeral: true,
        });
      }

      if (action === "remove") {
        // Remove item from inventory
        if (!userProfile) {
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription("The user's inventory is empty."),
            ],
            emphemeral: true,
          });
        }

        const itemIndex = userProfile.items.findIndex(
          (i) => i.itemId.toString() === item._id.toString()
        );

        if (
          itemIndex === -1 ||
          userProfile.items[itemIndex].quantity < quantity
        ) {
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription(
                  "The user does not have enough of this item in their inventory."
                ),
            ],
            emphemeral: true,
          });
        }

        userProfile.items[itemIndex].quantity -= quantity;
        if (userProfile.items[itemIndex].quantity === 0) {
          userProfile.items.splice(itemIndex, 1);
        }

        await userProfile.save();

        // Log removing item
        const adminChannel = await AdminChannels.findOne({
          name: "itemLog",
        });
        const deleteLogChannel = adminChannel
          ? interaction.client.channels.cache.get(adminChannel.channelId)
          : null;

        if (deleteLogChannel) {
          const deleteLogEmbed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("Removing item to user by Admin")
            .setDescription(
              `An item has been removed by ${interaction.user.tag}.`
            )
            .addFields(
              {
                name: `Quantity: `,
                value: `\`${quantity}\``,
                inline: true,
              },
              {
                name: "Item: ",
                value: `\`${item.name}\``,
                inline: true,
              },
              {
                name: "From: ",
                value: `\`${userProfileData.characterName}\``,
              }
            )
            .setTimestamp()
            .setFooter({
              text: `${interaction.guild.name} | Removed by: ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          deleteLogChannel.send({ embeds: [deleteLogEmbed] });
        }

        // Notify the user via DM
        const deleteDmEmbed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle("Removed items from your inventory by Admin")
          .setDescription(
            `Removed **${quantity}** of **${item.name}** from ${user.username}'s inventory.`
          )
          .setTimestamp()
          .setFooter({
            text: `${interaction.guild.name} | Removed by: ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        try {
          await user.send({ embeds: [deleteDmEmbed] });
        } catch (err) {
          console.error(`Could not send DM to user ${user.tag}: ${err}`);
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription(`The user can't be notifed on DMs!`),
            ],
          });
        }

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setDescription(
                `Removed **${quantity}** of **${item.name}** from ${user.username}'s inventory.`
              ),
          ],
          emphemeral: true,
        });
      }
    } catch (err) {
      console.error(err);
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "An error occurred while managing the user's inventory."
            ),
        ],
        emphemeral: true,
      });
    }
  },
};
