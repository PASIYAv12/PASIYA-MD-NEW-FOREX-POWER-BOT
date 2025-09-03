module.exports = {
  name: "hello",
  description: "Greets the user",
  execute: async (client, message) => {
    await message.reply("Hello! How can I help you?");
  }
};
