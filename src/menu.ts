import { Context, Telegraf } from "telegraf";
import { state } from "./state";
import { sendOrder, closeAll } from "./mt5";

function isAdmin(id?: number) {
  const ids = (process.env.ADMIN_TELEGRAM_USER_IDS || "").split(",").map(s=>s.trim());
  return id && ids.includes(String(id));
}

export function registerMenu(bot: Telegraf) {
  bot.start((ctx: Context) => {
    if (!isAdmin(ctx.from?.id)) return ctx.reply("❌ Unauthorized");
    ctx.reply("✅ Forex Bot online. /menu");
  });

  bot.command("menu", (ctx) => {
    if (!isAdmin(ctx.from?.id)) return ctx.reply("❌ Unauthorized");
    ctx.reply(
`📊 Menu
/on  – Bot ON
/off – Bot OFF
/buy – BUY 0.01
/sell – SELL 0.01
/close – Close all
/status – Show status`
    );
  });

  bot.command("on",   (ctx) => { if(!isAdmin(ctx.from?.id))return; state.botEnabled=true;  ctx.reply("✅ Bot ON"); });
  bot.command("off",  (ctx) => { if(!isAdmin(ctx.from?.id))return; state.botEnabled=false; ctx.reply("⏹ Bot OFF"); });
  bot.command("status",(ctx)=> {
    if(!isAdmin(ctx.from?.id))return;
    ctx.reply(`🤖 Bot: ${state.botEnabled?"ON":"OFF"} | Auto: ${state.autoTrade?"ON":"OFF"} | Risk: ${state.risk}`);
  });

  bot.command("buy",  async (ctx)=> { if(!isAdmin(ctx.from?.id))return; await sendOrder("BUY","EURUSD",0.01); ctx.reply("📈 BUY sent"); });
  bot.command("sell", async (ctx)=> { if(!isAdmin(ctx.from?.id))return; await sendOrder("SELL","EURUSD",0.01); ctx.reply("📉 SELL sent"); });
  bot.command("close",async (ctx)=> { if(!isAdmin(ctx.from?.id))return; await closeAll(); ctx.reply("❌ Closed all"); });
    }
