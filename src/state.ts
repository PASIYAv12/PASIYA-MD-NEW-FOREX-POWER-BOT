export const state = {
  botEnabled: (process.env.BOT_ENABLED || "true") === "true",
  autoTrade: (process.env.AUTO_TRADE || "false") === "true",
  risk: parseFloat(process.env.RISK_PER_TRADE || "0.01")
};
