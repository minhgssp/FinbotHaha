import { createClient } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Đọc biến môi trường cho Vercel KV với tiền tố tùy chỉnh FINBOT_
const API_URL = process.env.FINBOT_KV_REST_API_URL;
const API_TOKEN = process.env.FINBOT_KV_REST_API_TOKEN;
const DATA_KEY = 'financial_app_data_v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!API_URL || !API_TOKEN) {
    return res.status(500).json({ error: 'Server configuration error: KV store not configured. Please set FINBOT_KV_REST_API_URL and FINBOT_KV_REST_API_TOKEN environment variables.' });
  }

  const kv = createClient({ url: API_URL, token: API_TOKEN });

  try {
    if (req.method === 'GET') {
      const data = await kv.get(DATA_KEY);
      return res.status(200).json(data); // Returns null if not found, which is fine
    }

    if (req.method === 'POST') {
      // Basic validation to ensure we're not saving empty/malformed data
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid data format.' });
      }
      await kv.set(DATA_KEY, req.body);
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).setHeader('Allow', ['GET', 'POST']).end('Method Not Allowed');
  } catch (error) {
    console.error('KV operation failed:', error);
    return res.status(500).json({ error: 'A server error occurred while accessing data.' });
  }
}