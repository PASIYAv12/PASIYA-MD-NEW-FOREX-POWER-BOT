import express from "express";
import { Telegraf } from "telegraf";
import { registerMenu } from "./menu";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN missing");

const bot = new Telegraf(token);
registerMenu(bot);
bot.launch();
console.log("🚀 Bot started");

// keep Heroku web dyno happy
const app = express();
app.get("/", (_req,res)=>res.send("OK"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("HTTP server on", PORT));
