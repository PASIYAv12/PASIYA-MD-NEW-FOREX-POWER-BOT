# PASIYA-MD-NEW-FOREX-POWER-BOT  

# Forex AutoBot (Node.js + TypeScript)

**Important:** This project is for **education/testing**. Live auto trading is **high risk**. There is **no such thing as 100% win**. Use demo accounts first. You are responsible for compliance and losses.

## What you get
- Telegram bot with admin-only **ON/OFF**, **Auto-Trade ON/OFF**, **Risk & Targets**, **Manual Buy/Sell**, **Close All**, **Status**, **PnL report**.
- **Daily summary** auto-sent to admins.
- **MT5 Bridge (placeholder)** via REST: you can connect any bridge that can place orders on MT5/Exness.
- Deploy templates: **Heroku (heroku.yml + app.json)** and **VPS (Dockerfile + docker-compose)**.
- File-based JSON storage (`/data/state.json`).

## Quick start (local)
```bash
cp .env.example .env
# edit .env with your TELEGRAM_BOT_TOKEN and admin IDs
npm install
npm run build
npm start
