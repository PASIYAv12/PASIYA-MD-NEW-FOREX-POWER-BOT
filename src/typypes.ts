# src/types.ts
```ts
export type Role = "ADMIN" | "USER";

export interface BotState {
  botEnabled: boolean;
  autoTrade: boolean;
  riskPerTrade: number; // 0.01 = 1%
  dailyProfitTargetMin: number;
  dailyProfitTargetMax: number;
  maxDrawdownPercent: number;
  equityUSD: number;
  realizedPnLUSD: number;
  openTrades: Trade[];
  lastResetISO?: string;
}

export interface Trade {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  lot: number;
  tp?: number;
  sl?: number;
  openedAtISO: string;
  status: "OPEN" | "CLOSED";
  closedAtISO?: string;
  pnlUSD?: number;
}

export interface OrderRequest {
  symbol: string;
  side: "BUY" | "SELL";
  lot: number;
  tp?: number;
  sl?: number;
  comment?: string;
}
