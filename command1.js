module.exports = {
  name: "ping",
  description: "Responds with pong",
  execute: async (client, message) => {
    await message.reply("pong");
  }
};
