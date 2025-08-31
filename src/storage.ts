import fs from "fs";
import path from "path";
import { BotState, Trade } from "./types";

const dataDir = path.join(process.cwd(), "data");
const statePath = path.join(dataDir, "state.json");

const defaultState: BotState = {
  botEnabled: true,
  autoTrade: false,
  riskPerTrade: 0.01,
  dailyProfitTargetMin: 50000,
  dailyProfitTargetMax: 500000,
  maxDrawdownPercent: 5,
  equityUSD: 1000,
  realizedPnLUSD: 0,
  openTrades: [],
  lastResetISO: new Date().toISOString()
};

export function loadState(): BotState {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(statePath)) {
    saveState(defaultState);
    return { ...defaultState };
  }
  const raw = fs.readFileSync(statePath, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    saveState(defaultState);
    return { ...defaultState };
  }
}

export function saveState(state: BotState) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

export function recordTrade(trade: Trade) {
  const s = loadState();
  s.openTrades.push(trade);
  saveState(s);
}
