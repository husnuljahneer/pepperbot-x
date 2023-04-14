const { EmbedBuilder, PermissionsBitField, codeBlock } = require("discord.js");
const client = require("../../index");
const config = require("../../config/config.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
require("dotenv").config();
const API_URL_HF = process.env.API_URL_HF_MS;
const TOKEN_HF = process.env.TOKEN;
module.exports = {
  name: "messageCreate"
};

client.on("messageCreate", async (message) => {
  if (message.channel.name === "pepper-bot" && !message.author.bot) {
    if (
      message.content.includes("creator") ||
      message.content.includes("father") ||
      message.content.includes("created") ||
      message.content.includes("god") ||
      message.content.includes("master") ||
      message.content.includes("dad")
    ) {
      message.reply(
        `I think you want to know who my master is, it's WarM4chineRoxX#2013`
      );
    }

    if (message.content.match(/[0-9]+\s*[\+\-\*\/%]\s*[0-9]+/g)) {
      // Extract the arithmetic expression from the message
      const expression = message.content.match(
        /[0-9]+\s*[\+\-\*\/%]\s*[0-9]+/g
      )[0];
      // Remove any spaces from the expression
      const cleanedExpression = expression.replace(/\s/g, "");
      // Evaluate the arithmetic expression and return the result
      const result = eval(cleanedExpression);
      return message.reply(`The result of ${expression} is ${result}`);
    }

    API_URL = API_URL_HF;

    const payload = {
      inputs: {
        text: message.content
      }
    };
    // form the request headers with Hugging Face API key
    const headers = {
      Authorization: "Bearer " + process.env.TOKEN_HF
    };

    // set status to typing
    message.channel.sendTyping();
    // query the server
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
    // send message to channel as a reply
    return message.reply(botResponse);
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
