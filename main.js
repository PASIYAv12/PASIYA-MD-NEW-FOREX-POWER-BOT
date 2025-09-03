const commands = {};
commands["ping"] = require("./command1");
commands["hello"] = require("./command2");

// Simulate receiving a message
async function onMessage(client, message) {
  const text = message.text.toLowerCase();

  if (commands[text]) {
    await commands[text].execute(client, message);
  } else {
    await message.reply("Command not found.");
  }
}

// Dummy client and message to test
const client = {}; 
const message = {
  text: "ping",
  reply: async (msg) => console.log("Bot reply:", msg)
};

onMessage(client, message);
