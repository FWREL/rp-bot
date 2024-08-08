const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Item = require("../../Models/Item");
const AdminChannels = require("../../Models/AdminChannels");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adminitem")
    .setDescription("Manage items in the inventory")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a new item to the inventory")
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("The unique ID for the item")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the item")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("Description of the item")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("image")
            .setDescription("Image of the item")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit")
        .setDescription("Edit an existing item in the inventory")
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the item to edit")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("name").setDescription("The new name of the item")
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("The new description of the item")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete an item from the inventory")
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the item to delete")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    // Check if the user has the "Administrator" role
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

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "create") {
      const name = interaction.options.getString("name");
      const description = interaction.options.getString("description");
      const id = interaction.options.getInteger("id");
      const imageURL = interaction.options.getString("image");

      // Check if item with the same ID already exists
      const existingItem = await Item.findOne({ id });
      if (existingItem) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(`Item with ID ${id} already exists.`),
          ],
          ephemeral: true,
        });
      }

      // Create a new item
      const newItem = new Item({
        id,
        name,
        description,
        imageURL,
      });

      await newItem.save();

      // Log for creating item
      const adminChannel = await AdminChannels.findOne({
        name: "itemLog",
      });
      const createItemLogChannel = adminChannel
        ? interaction.client.channels.cache.get(adminChannel.channelId)
        : null;

      if (createItemLogChannel) {
        const createItemLogEmbed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle(`Creating an item by Admin`)
          .setDescription(
            `An item has been created by ${interaction.user.tag}.`
          )
          .addFields(
            {
              name: "ID: ",
              value: id,
              inline: true,
            },
            {
              name: "Name Item: ",
              value: name,
              inline: true,
            },
            {
              name: "Description: ",
              value: description,
            }
          )
          .setThumbnail(imageURL || "https://via.placeholder.com/100")
          .setTimestamp()
          .setFooter({
            text: `${interaction.guild.name} | By: ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        createItemLogChannel.send({ embeds: [createItemLogEmbed] });
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `Item **${name}** has been created with ID **${id}**.`
            ),
        ],
      });
    } else if (subcommand === "edit") {
      const id = interaction.options.getInteger("id");
      const name = interaction.options.getString("name");
      const description = interaction.options.getString("description");
      const image = interaction.options.getString("image");

      // Find the item by ID
      const item = await Item.findOne({ id });
      if (!item) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(`Item with ID ${id} not found.`),
          ],
          ephemeral: true,
        });
      }

      // Update item details
      if (name) item.name = name;
      if (description) item.description = description;
      if (image) item.imageURL = image;

      await item.save();

      // Log for editing item
      const adminChannel = await AdminChannels.findOne({
        name: "itemLog",
      });
      const editItemLogChannel = adminChannel
        ? interaction.client.channels.cache.get(adminChannel.channelId)
        : null;

      if (editItemLogChannel) {
        const editItemLogEmbed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle(`Editing an item by Admin`)
          .setDescription(`An item has been edited by ${interaction.user.tag}.`)
          .addFields(
            {
              name: "ID: ",
              value: id,
              inline: true,
            },
            {
              name: "Name Item: ",
              value: name,
              inline: true,
            },
            {
              name: "Description: ",
              value: description,
            }
          )
          .setThumbnail(image || "https://via.placeholder.com/100")
          .setTimestamp()
          .setFooter({
            text: `${interaction.guild.name} | By: ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        editItemLogChannel.send({ embeds: [editItemLogEmbed] });
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`Item with ID **${id}** has been updated.`),
        ],
      });
    } else if (subcommand === "delete") {
      const id = interaction.options.getInteger("id");

      // Find the item by ID
      const item = await Item.findOne({ id });
      if (!item) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(`Item with ID ${id} not found.`),
          ],
          ephemeral: true,
        });
      }

      // Delete the item
      await item.deleteOne({ id });

      // Log for editing item
      const adminChannel = await AdminChannels.findOne({
        name: "itemLog",
      });
      const deleteItemLogChannel = adminChannel
        ? interaction.client.channels.cache.get(adminChannel.channelId)
        : null;

      if (deleteItemLogChannel) {
        const deleteItemLogEmbed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle(`Deleting an item by Admin`)
          .setDescription(
            `An item has been deleted by ${interaction.user.tag}.`
          )
          .addFields(
            {
              name: "ID: ",
              value: id,
              inline: true,
            },
            {
              name: "Name Item: ",
              value: name,
              inline: true,
            },
            {
              name: "Description: ",
              value: description,
            }
          )
          .setThumbnail(image || "https://via.placeholder.com/100")
          .setTimestamp()
          .setFooter({
            text: `${interaction.guild.name} | By: ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        deleteItemLogChannel.send({ embeds: [deleteItemLogEmbed] });
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`Item with ID **${id}** has been deleted.`),
        ],
      });
    }
  },
};
