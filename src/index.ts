import TelegramBot from "node-telegram-bot-api";
import express from "express";
import { CFG } from "./config";
import logger from "./logger";
import { isAdmin } from "./guards";
import { replyMenu } from "./menu";
import { loadState, saveState } from "./storage";
import { placeOrder, closeAll } from "./mt5Bridge";
import { v4 as uuidv4 } from "uuid";

if (!CFG.token) {
  logger.error("Missing TELEGRAM_BOT_TOKEN");
  process.exit(1);
}

const bot = new TelegramBot(CFG.token, { polling: true });
const app = express();
app.use(express.json());

app.get("/", (_req, res) => res.send("Forex AutoBot is running"));
app.listen(CFG.http.port, () => logger.info(`HTTP on :${CFG.http.port}`));

function ensureDailyReset() {
  const s = loadState();
  const today = new Date().toDateString();
  const last = s.lastResetISO ? new Date(s.lastResetISO).toDateString() : "";
  if (today !== last) {
    s.realizedPnLUSD = 0;
    s.openTrades = [];
    s.lastResetISO = new Date().toISOString();
    saveState(s);
  }
}
setInterval(ensureDailyReset, 60 * 1000);

bot.setMyCommands([
  { command: "start", description: "Start / show menu" },
  { command: "menu", description: "Show control menu" },
  { command: "status", description: "Show bot status" },
  { command: "ingest", description: "Ingest a signal: /ingest BTCUSD BUY" }
]);

bot.onText(/\/start|\/menu/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Welcome to Forex AutoBot.\nNote: For education/testing only. Use at your own risk.", replyMenu());
});

bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const s = loadState();
  bot.sendMessage(chatId, formatStatus(s), replyMenu());
});

bot.onText(/\/ingest (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isAdmin(msg.from?.id)) return bot.sendMessage(chatId, "Admins only.");
  const parts = (match?.[1] || "").trim().split(/\s+/);
  const symbol = (parts[0] || "").toUpperCase();
  const side = (parts[1] || "").toUpperCase();
  if (!symbol || !["BUY","SELL"].includes(side)) {
    return bot.sendMessage(chatId, "Usage: /ingest SYMBOL BUY|SELL");
  }
  const s = loadState();
  const lot = Math.max(0.01, Number((s.equityUSD * s.riskPerTrade / 10000).toFixed(2)));
  try {
    const resp = await placeOrder({ symbol, side: side as any, lot, comment: "signal" });
    await bot.sendMessage(chatId, `Signal executed: ${symbol} ${side} lot=${lot}\nBridge: ${JSON.stringify(resp)}`);
  } catch (e:any) {
    await bot.sendMessage(chatId, `Bridge error: ${e.message || e}`);
  }
});

bot.on("message", async (msg) => {
  if (!msg.text) return;
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  if (["🟢 Bot ON","🔴 Bot OFF","🤖 AutoTrade ON","🛑 AutoTrade OFF","📈 Manual BUY","📉 Manual SELL","❌ Close All","⚙️ Set Risk","🎯 Set Targets","📊 PnL Report","🔄 Status"].includes(text)) {
    if (!isAdmin(msg.from?.id)) return bot.sendMessage(chatId, "Admins only.");
  }

  const s = loadState();

  switch (text) {
    case "🔄 Status":
      bot.sendMessage(chatId, formatStatus(s), replyMenu());
      break;
    case "🟢 Bot ON":
      s.botEnabled = true; saveState(s);
      bot.sendMessage(chatId, "Bot enabled ✅", replyMenu());
      break;
    case "🔴 Bot OFF":
      s.botEnabled = false; saveState(s);
      bot.sendMessage(chatId, "Bot disabled ⛔", replyMenu());
      break;
    case "🤖 AutoTrade ON":
      s.autoTrade = true; saveState(s);
      bot.sendMessage(chatId, "AutoTrade enabled 🤖✅", replyMenu());
      break;
    case "🛑 AutoTrade OFF":
      s.autoTrade = false; saveState(s);
      bot.sendMessage(chatId, "AutoTrade disabled 🛑", replyMenu());
      break;
    case "📈 Manual BUY":
    case "📉 Manual SELL":
      bot.sendMessage(chatId, "Send order like: SYMBOL LOT (optional TP SL)\nExample: EURUSD 0.10 50 30", { reply_markup: { force_reply: true } });
      break;
    case "❌ Close All":
      try {
        const resp = await closeAll();
        bot.sendMessage(chatId, `Close-all sent: ${JSON.stringify(resp)}`);
      } catch (e:any) {
        bot.sendMessage(chatId, `Bridge error: ${e.message || e}`);
      }
      break;
    case "⚙️ Set Risk":
      bot.sendMessage(chatId, "Send new risk per trade (e.g., 0.01 for 1%)", { reply_markup: { force_reply: true } });
      break;
    case "🎯 Set Targets":
      bot.sendMessage(chatId, "Send targets like: MIN MAX (USD)\nExample: 50000 500000", { reply_markup: { force_reply: true } });
      break;
    case "📊 PnL Report":
      bot.sendMessage(chatId, `Realized PnL (USD): ${s.realizedPnLUSD.toFixed(2)}\nEquity (USD): ${s.equityUSD.toFixed(2)}`);
      break;
  }
});

bot.on("message", async (msg) => {
  if (!msg.text || !msg.reply_to_message) return;
  const chatId = msg.chat.id;
  if (!isAdmin(msg.from?.id)) return;

  const prompt = msg.reply_to_message.text || "";
  const s = loadState();

  if (prompt.startsWith("Send order like")) {
    const parts = msg.text.trim().split(/\s+/);
    const symbol = (parts[0] || "").toUpperCase();
    const lot = Number(parts[1] || "0.1");
    const tp = parts[2] ? Number(parts[2]) : undefined;
    const sl = parts[3] ? Number(parts[3]) : undefined;
    const side = prompt.includes("Manual BUY") ? "BUY" : "SELL";
    if (!symbol) return bot.sendMessage(chatId, "Invalid symbol.");
    try {
      const resp = await placeOrder({ symbol, side: side as any, lot, tp, sl, comment: "manual" });
      bot.sendMessage(chatId, `Order sent: ${symbol} ${side} lot=${lot} TP=${tp ?? "-"} SL=${sl ?? "-"}\nBridge: ${JSON.stringify(resp)}`);
    } catch (e:any) {
      bot.sendMessage(chatId, `Bridge error: ${e.message || e}`);
    }
  }

  if (prompt.startsWith("Send new risk per trade")) {
    const v = Number(msg.text.trim());
    if (Number.isFinite(v) && v > 0 && v < 1) {
      s.riskPerTrade = v; saveState(s);
      bot.sendMessage(chatId, `Risk per trade set to ${(v*100).toFixed(2)}%`);
    } else {
      bot.sendMessage(chatId, "Invalid. Use a decimal like 0.01 for 1%.");
    }
  }

  if (prompt.startsWith("Send targets like")) {
    const parts = msg.text.trim().split(/\s+/);
    const min = Number(parts[0]); const max = Number(parts[1]);
    if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min) {
      s.dailyProfitTargetMin = min; s.dailyProfitTargetMax = max; saveState(s);
      bot.sendMessage(chatId, `Targets set: $${min} – $${max}`);
    } else {
      bot.sendMessage(chatId, "Invalid. Example: 50000 500000");
    }
  }
});

function formatStatus(s: ReturnType<typeof loadState>) {
  return [
    `Bot: ${s.botEnabled ? "ENABLED ✅" : "DISABLED ⛔"}`,
    `AutoTrade: ${s.autoTrade ? "ON 🤖" : "OFF 🛑"}`,
    `Risk/Trade: ${(s.riskPerTrade*100).toFixed(2)}%`,
    `Targets: $${s.dailyProfitTargetMin} – $${s.dailyProfitTargetMax}`,
    `Max Drawdown: ${s.maxDrawdownPercent}%`,
    `Equity: $${s.equityUSD.toFixed(2)}`,
    `Realized PnL: $${s.realizedPnLUSD.toFixed(2)}`
  ].join("\n");
}

setInterval(async () => {
  const now = new Date();
  if (now.getUTCMinutes() === 59 && now.getUTCSeconds() < 2) {
    const s = loadState();
    for (const admin of CFG.adminUserIds) {
      try {
        await bot.sendMessage(admin, `Daily Summary:\nEquity: $${s.equityUSD.toFixed(2)}\nRealized PnL: $${s.realizedPnLUSD.toFixed(2)}`);
      } catch {}
    }
  }
}, 1000);
