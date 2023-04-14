const { EmbedBuilder, PermissionsBitField, codeBlock } = require("discord.js");
const client = require("../../index");
const config = require("../../config/config.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
require("dotenv").config();
const API_URL_HF = process.env.API_URL_HF_MS;
const TOKEN_HF = process.env.TOKEN;
const hljs = require("highlight.js");

module.exports = {
  name: "messageCreate"
};

client.on("messageCreate", async (message) => {
  if (message.channel.name === "pepper-bot" && !message.author.bot) {
    try {
      // botmaster details
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
        return;
      }

      // current date
      if (
        message.content.toLowerCase().includes("current date") ||
        message.content.toLowerCase().includes("what's the date") ||
        message.content.toLowerCase().includes("today's date") ||
        message.content.toLowerCase().includes("date today")
      ) {
        // Create a new Date object with the current date and time
        const currentDate = new Date();
        // Get the current date in a human-readable format
        const formattedDate = currentDate.toLocaleDateString();
        // Return the current date in a message reply
        message.reply(`The current date is ${formattedDate}`);
        return;
      }

      //tell a joke
      if (
        message.content.toLowerCase().includes("tell me a joke") ||
        message.content.toLowerCase().includes("joke please") ||
        message.content.toLowerCase().includes("make me laugh") ||
        message.content.toLowerCase().includes("funny joke") ||
        message.content.toLowerCase().includes("joke time")
      ) {
        // Fetch a random joke from the API
        const response = await fetch(
          "https://official-joke-api.appspot.com/random_joke"
        );
        const data = await response.json();

        // Create an embedded message with the joke

        // Send the embedded message to the channel
        message.channel.send(data.setup + " " + data.punchline);

        return;
      }

      //current time

      if (
        message.content.toLowerCase().includes("current time") ||
        message.content.toLowerCase().includes("what's the time") ||
        message.content.toLowerCase().includes("time now") ||
        message.content.toLowerCase().includes("time is it")
      ) {
        // Create a new Date object with the current date and time
        const currentDate = new Date();
        // Get the current time in a human-readable format
        const formattedTime = currentDate.toLocaleTimeString();
        // Return the current time in a message reply
        message.reply(`The current time is ${formattedTime}`);
        return;
      }

      //current day

      if (
        message.content.toLowerCase().includes("current day") ||
        message.content.toLowerCase().includes("what's the day") ||
        message.content.toLowerCase().includes("day today")
      ) {
        // Create a new Date object with the current date and time
        const currentDate = new Date();
        // Get the current day in a human-readable format
        const formattedDay = currentDate.toLocaleDateString(undefined, {
          weekday: "long"
        });
        // Return the current day in a message reply
        message.reply(`Today is ${formattedDay}`);
        return;
      }

      //maths equations
      if (message.content.match(/[0-9]+\s*[\+\-\*\/%]\s*[0-9]+/g)) {
        // Extract the arithmetic expression from the message
        const expression = message.content.match(
          /[0-9]+\s*[\+\-\*\/%]\s*[0-9]+/g
        )[0];
        // Remove any spaces from the expression
        const cleanedExpression = expression.replace(/\s/g, "");
        // Evaluate the arithmetic expression and return the result
        const result = eval(cleanedExpression);

        message.reply(`The result of ${expression} is ${result}`);
        return;
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
      message.reply(botResponse);
      return;
    } catch (error) {
      console.log(error);
    }
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
