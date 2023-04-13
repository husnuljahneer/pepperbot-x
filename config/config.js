require("dotenv").config();

module.exports = {
  Prefix: process.env.BOT_PREFIX, // YOUR BOT PREFIX.

  Users: {
    OWNERS: [process.env.BOT_OWNER] // THE BOT OWNERS ID.
  },

  Handlers: {
    MONGO: process.env.MONGO_URI
  },

  Client: {
    TOKEN: process.env.BOT_TOKEN, // YOUR BOT TOKEN. (USE THIS ONLY IN VSCODE)
    ID: process.env.CLIENT_ID // YOUR BOT ID.
  }
};
