import TelegramBot from "node-telegram-bot-api";

export function mainMenu(): TelegramBot.KeyboardButton[][] {
  return [
    [{ text: "🔄 Status" }, { text: "🟢 Bot ON" }, { text: "🔴 Bot OFF" }],
    [{ text: "🤖 AutoTrade ON" }, { text: "🛑 AutoTrade OFF" }],
    [{ text: "📈 Manual BUY" }, { text: "📉 Manual SELL" }],
    [{ text: "❌ Close All" }],
    [{ text: "⚙️ Set Risk" }, { text: "🎯 Set Targets" }],
    [{ text: "📊 PnL Report" }]
  ];
}

export function replyMenu() {
  return {
    reply_markup: {
      keyboard: mainMenu(),
      resize_keyboard: true
    }
  } as TelegramBot.SendMessageOptions;
}
