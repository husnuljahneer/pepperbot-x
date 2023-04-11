const { REST, Routes } = require("discord.js");
const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const client_secret = require("./config/bot");
const TOKEN = client_secret.discord.token;
const CLIENT_ID = client_secret.discord.client_id;
const commands = [
  {
    name: "ping",
    description: "Replies with Pong!"
  }
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.login(TOKEN);
