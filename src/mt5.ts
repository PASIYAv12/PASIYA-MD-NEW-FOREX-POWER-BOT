import axios from "axios";

const BASE = (process.env.MT5_BRIDGE_URL || "").replace(/\/+$/,"");
const KEY  = process.env.MT5_BRIDGE_API_KEY || "";

function auth() {
  return { headers: { Authorization: `Bearer ${KEY}` } };
}

export async function sendOrder(side: "BUY"|"SELL", symbol: string, lot: number) {
  if(!BASE) { console.error("MT5_BRIDGE_URL missing"); return; }
  try {
    await axios.post(`${BASE}/order`, { side, symbol, lot }, auth());
  } catch(e:any) {
    console.error("order error", e?.response?.data || e.message);
  }
}

export async function closeAll() {
  if(!BASE) return;
  try {
    await axios.post(`${BASE}/close-all`, {}, auth());
  } catch(e:any) {
    console.error("close error", e?.response?.data || e.message);
  }
}
