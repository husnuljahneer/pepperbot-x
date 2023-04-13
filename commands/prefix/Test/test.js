const { EmbedBuilder } = require("discord.js");

module.exports = {
  config: {
    name: "test",
    description: "Replies with test!"
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db) => {
    message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `🏓 **Pong!** Client websocket ping: \`${client.ws.ping}\` ms.`
          )
          .setColor("Green")
      ]
    });
  }
};
