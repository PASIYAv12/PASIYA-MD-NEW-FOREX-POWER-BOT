import dotenv from "dotenv";
dotenv.config();

function csv(env?: string): string[] {
  if (!env) return [];
  return env.split(",").map(s => s.trim()).filter(Boolean);
}

export const CFG = {
  token: process.env.TELEGRAM_BOT_TOKEN || "",
  adminUserIds: csv(process.env.ADMIN_TELEGRAM_USER_IDS).map(s => Number(s)).filter(n => !Number.isNaN(n)),
  adminPhones: csv(process.env.ADMIN_PHONE_NUMBERS),
  defaults: {
    autoTrade: (process.env.AUTO_TRADE || "false").toLowerCase() === "true",
    botEnabled: (process.env.BOT_ENABLED || "true").toLowerCase() === "true",
    riskPerTrade: Number(process.env.RISK_PER_TRADE || "0.01"),
    dailyProfitTargetMin: Number(process.env.DAILY_PROFIT_TARGET_MIN || "50000"),
    dailyProfitTargetMax: Number(process.env.DAILY_PROFIT_TARGET_MAX || "500000"),
    maxDrawdownPercent: Number(process.env.MAX_DRAWDOWN_PERCENT || "5"),
  },
  mt5: {
    url: process.env.MT5_BRIDGE_URL || "http://localhost:8787",
    apiKey: process.env.MT5_BRIDGE_API_KEY || "changeme"
  },
  http: {
    port: Number(process.env.PORT || "3000")
  }
};
