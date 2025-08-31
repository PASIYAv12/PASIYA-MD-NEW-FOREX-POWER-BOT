import axios from "axios";
import { CFG } from "./config";
import { OrderRequest } from "./types";

export async function placeOrder(req: OrderRequest) {
  const url = `${CFG.mt5.url}/order`;
  const headers = { "x-api-key": CFG.mt5.apiKey };
  const res = await axios.post(url, req, { headers, timeout: 10000 });
  return res.data;
}

export async function closeAll(symbol?: string) {
  const url = `${CFG.mt5.url}/close-all`;
  const headers = { "x-api-key": CFG.mt5.apiKey };
  const res = await axios.post(url, { symbol }, { headers, timeout: 10000 });
  return res.data;
}
