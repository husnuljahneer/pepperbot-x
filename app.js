const { REST, Routes, discord } = require("discord.js");
const { Client, GatewayIntentBits } = require("discord.js");
// const discord = require("discord.js");
require("dotenv").config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const client_secret = require("./config/bot");
const TOKEN = client_secret.discord.token;
const CLIENT_ID = client_secret.discord.client_id;
const PREFIX = client_secret.discord.prefix;
const fs = require("fs");

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

client.config = require("./config/bot");
client.emotes = client.config.emojis;

// client.commands = new discord.LimitedCollection();

fs.readdirSync("./commands").forEach((dirs) => {
  const commands = fs
    .readdirSync(`./commands/${dirs}`)
    .filter((files) => files.endsWith(".js"));

  for (const file of commands) {
    const command = require(`./commands/${dirs}/${file}`);
    console.log(`Loading command ${file}`);
    client.commands.set(command.name.toLowerCase(), command);
  }
});

const events = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of events) {
  console.log(`Loading discord.js event ${file}`);
  const event = require(`./events/${file}`);
  client.on(file.split(".")[0], event.bind(null, client));
}

// client.on("ready", () => {
//   console.log(`Logged in as ${client.user.tag}!`);
// });

client.on("interactionCreate", async (interaction) => {
  console.log(PREFIX + "ping");
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === PREFIX + "ping") {
    await interaction.reply("Pong!");
  }
});

client.login(TOKEN);
