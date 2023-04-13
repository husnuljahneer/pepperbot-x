const { EmbedBuilder, PermissionsBitField, codeBlock } = require("discord.js");
const client = require("../../index");
const config = require("../../config/config.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
require("dotenv").config();
const API_URL_HF = process.env.API_URL_HF;
const TOKEN_HF = process.env.TOKEN;
module.exports = {
  name: "messageCreate"
};

client.on("messageCreate", async (message) => {
  if (message.channel.name === "pepper-bot" && !message.author.bot) {
    API_URL = API_URL_HF;

    const payload = {
      inputs: {
        text: message.content
      }
    };

    const headers = {
      Authorization: "Bearer " + TOKEN_HF
    };

    const response = await fetch(API_URL, {
      method: "post",
      body: JSON.stringify(payload),
      headers: headers
    });
    const data = await response.json();
    let botResponse = "";
    if (data.hasOwnProperty("generated_text")) {
      botResponse = data.generated_text;
    } else if (data.hasOwnProperty("error")) {
      // error condition
      botResponse = data.error;
    }

    // interaction.reply(botResponse);
    message.reply({
      embeds: [new EmbedBuilder().setDescription(botResponse).setColor("Green")]
    });
  }
  if (message.channel.type !== 0) return;
  if (message.author.bot) return;

  const prefix =
    (await db.get(`guild_prefix_${message.guild.id}`)) || config.Prefix || "?";

  if (!message.content.startsWith(prefix)) return;
  if (!message.guild) return;
  if (!message.member)
    message.member = await message.guild.fetchMember(message);

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  if (cmd.length == 0) return;

  let command = client.prefix_commands.get(cmd);

  if (!command) return;

  if (command) {
    if (command.permissions) {
      if (
        !message.member.permissions.has(
          PermissionsBitField.resolve(command.permissions || [])
        )
      )
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `🚫 Unfortunately, you are not authorized to use this command.`
              )
              .setColor("Red")
          ]
        });
    }

    if ((command.owner, command.owner == true)) {
      if (config.Users?.OWNERS) {
        const allowedUsers = []; // New Array.

        config.Users.OWNERS.forEach((user) => {
          const fetchedUser = message.guild.members.cache.get(user);
          if (!fetchedUser) return allowedUsers.push("*Unknown User#0000*");
          allowedUsers.push(`${fetchedUser.user.tag}`);
        });

        if (!config.Users.OWNERS.some((ID) => message.member.id.includes(ID)))
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `🚫 Sorry but only owners can use this command! Allowed users:\n**${allowedUsers.join(
                    ", "
                  )}**`
                )
                .setColor("Red")
            ]
          });
      }
    }

    try {
      command.run(client, message, args, prefix, config, db);
    } catch (error) {
      console.error(error);
    }
  }
});
