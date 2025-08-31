import axios from 'axios';

export async function connectMT5() {
  const url = process.env.MT5_BRIDGE_URL;
  const apiKey = process.env.MT5_BRIDGE_API_KEY;

  try {
    const res = await axios.get(`${url}/status?api_key=${apiKey}`);
    console.log('MT5 Bridge Status:', res.data);
  } catch (err) {
    console.error('MT5 Bridge connection failed:', err.message);
  }
}
