import { Telegraf } from 'telegraf';
import { connectMT5 } from './mt5';
import { handleMenu } from './menu';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// Only allow admin IDs
const adminIDs = (process.env.ADMIN_TELEGRAM_USER_IDS || '').split(',');

bot.start((ctx) => {
  if (!adminIDs.includes(ctx.from?.id.toString())) return ctx.reply('Not authorized');
  ctx.reply('Forex AutoBot Started! Use /menu to control');
});

bot.command('menu', (ctx) => handleMenu(ctx));

connectMT5(); // MT5 bridge connect

bot.launch();
console.log('🚀 Forex AutoBot running...');
