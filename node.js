Forex AutoBot (Node.js)

මෙන්න සම්පූර්ණ Node.js Forex Auto Trading Bot project එකේ source code එක file by file breakdown එක:


---

📂 package.json

{
  "name": "forex-autobot-node",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "axios": "^1.6.2",
    "dotenv": "^16.3.1",
    "node-telegram-bot-api": "^0.61.0"
  },
  "devDependencies": {
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.2.2"
  }
}


---

📂 tsconfig.json

{
  "compilerOptions": {
    "outDir": "./dist",
    "module": "commonjs",
    "target": "es6",
    "esModuleInterop": true,
    "strict": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}


---

📂 .env.example

TELEGRAM_BOT_TOKEN=8067527058:AAFd66Gf3UXUseiGGM725gbZeqwRso2EwBg
ADMIN_TELEGRAM_USER_IDS=947845488818,94766359869
ADMIN_PHONE_NUMBERS=947845488818,94766359869
MT5_BRIDGE_URL=http://localhost:5000
MT5_BRIDGE_API_KEY=changeme


---

📂 src/index.ts

import dotenv from 'dotenv';
dotenv.config();

import TelegramBot from 'node-telegram-bot-api';
import { handleCommand } from './menu';

const token = process.env.TELEGRAM_BOT_TOKEN as string;
if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");

const bot = new TelegramBot(token, { polling: true });

console.log("🚀 Forex AutoBot started...");

bot.on('message', async (msg) => {
  if (!msg.text) return;
  await handleCommand(bot, msg);
});


---

📂 src/menu.ts

import TelegramBot, { Message } from 'node-telegram-bot-api';
import { isAdmin } from './utils';
import { sendOrder, closeAllOrders } from './mt5';
import { state } from './state';

export async function handleCommand(bot: TelegramBot, msg: Message) {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  if (text === "/start") {
    return bot.sendMessage(chatId, "📊 Forex AutoBot Ready!", {
      reply_markup: {
        keyboard: [
          ["▶️ Bot ON", "⏹ Bot OFF"],
          ["📈 Buy", "📉 Sell", "❌ Close All"],
          ["⚙️ Set Risk", "🎯 Set Targets"],
          ["💰 Status"]
        ],
        resize_keyboard: true
      }
    });
  }

  if (!isAdmin(msg)) {
    return bot.sendMessage(chatId, "⛔ Unauthorized");
  }

  if (text === "▶️ Bot ON") {
    state.botEnabled = true;
    return bot.sendMessage(chatId, "✅ Bot Enabled");
  }

  if (text === "⏹ Bot OFF") {
    state.botEnabled = false;
    return bot.sendMessage(chatId, "⏹ Bot Disabled");
  }

  if (text === "📈 Buy") {
    await sendOrder("BUY", 0.01);
    return bot.sendMessage(chatId, "✅ BUY order sent");
  }

  if (text === "📉 Sell") {
    await sendOrder("SELL", 0.01);
    return bot.sendMessage(chatId, "✅ SELL order sent");
  }

  if (text === "❌ Close All") {
    await closeAllOrders();
    return bot.sendMessage(chatId, "✅ All orders closed");
  }

  if (text === "💰 Status") {
    return bot.sendMessage(chatId, `Bot: ${state.botEnabled ? "ON" : "OFF"}\nRisk: ${state.risk}\nTarget: ${state.targetMin} - ${state.targetMax}`);
  }

  if (text.startsWith("⚙️ Set Risk")) {
    state.risk = 0.01;
    return bot.sendMessage(chatId, "⚙️ Risk set to 1%");
  }

  if (text.startsWith("🎯 Set Targets")) {
    state.targetMin = 50000;
    state.targetMax = 500000;
    return bot.sendMessage(chatId, "🎯 Targets set: $50,000 - $500,000");
  }
}


---

📂 src/utils.ts

import { Message } from 'node-telegram-bot-api';

export function isAdmin(msg: Message): boolean {
  const admins = process.env.ADMIN_TELEGRAM_USER_IDS?.split(",") || [];
  return admins.includes(msg.from?.id.toString() || "");
}


---

📂 src/state.ts

export const state = {
  botEnabled: false,
  risk: 0.01,
  targetMin: 50000,
  targetMax: 500000
};


---

📂 src/mt5.ts

import axios from 'axios';

const MT5_URL = process.env.MT5_BRIDGE_URL || "";
const API_KEY = process.env.MT5_BRIDGE_API_KEY || "";

export async function sendOrder(type: "BUY" | "SELL", lot: number) {
  try {
    await axios.post(`${MT5_URL}/order`, { type, lot }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
  } catch (err) {
    console.error("MT5 order error", err);
  }
}

export async function closeAllOrders() {
  try {
    await axios.post(`${MT5_URL}/close-all`, {}, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
  } catch (err) {
    console.error("MT5 close error", err);
  }
}


---

📂 heroku.yml

build:
  docker:
    web: Dockerfile


---

📂 app.json

{
  "name": "forex-autobot-node",
  "description": "Forex Auto Trading Bot with Telegram Control",
  "env": {
    "TELEGRAM_BOT_TOKEN": {
      "required": true
    },
    "ADMIN_TELEGRAM_USER_IDS": {
      "required": true
    },
    "MT5_BRIDGE_URL": {
      "required": true
    },
    "MT5_BRIDGE_API_KEY": {
      "required": true
    }
  }
}


---

📂 Dockerfile

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]


---

📂 docker-compose.yml

version: '3'
services:
  bot:
    build: .
    env_file: .env
    restart: always


---

📂 Procfile

web: npm start

