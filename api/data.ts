import { createClient } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Đọc biến môi trường cho Vercel KV với tiền tố tùy chỉnh FINBOT_
const API_URL = process.env.FINBOT_KV_REST_API_URL;
const API_TOKEN = process.env.FINBOT_KV_REST_API_TOKEN;
const DATA_KEY = 'financial_app_data_v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[API /api/data] Handler invoked with method: ${req.method}`);

  if (!API_URL || !API_TOKEN) {
    console.error('[API /api/data] Server configuration error: KV store not configured.');
    return res.status(500).json({ error: 'Server configuration error: KV store not configured. Please set FINBOT_KV_REST_API_URL and FINBOT_KV_REST_API_TOKEN environment variables.' });
  }

  const kv = createClient({ url: API_URL, token: API_TOKEN });

  try {
    if (req.method === 'GET') {
      console.log('[API /api/data] Handling GET request.');
      const data = await kv.get(DATA_KEY);
      console.log('[API /api/data] Data retrieved from KV:', data);
      return res.status(200).json(data); // Returns null if not found, which is fine
    }

    if (req.method === 'POST') {
      console.log('[API /api/data] Handling POST request.');
      console.log('[API /api/data] Received body:', req.body);
      // Basic validation to ensure we're not saving empty/malformed data
      if (!req.body || typeof req.body !== 'object') {
        console.error('[API /api/data] Invalid data format received.');
        return res.status(400).json({ error: 'Invalid data format.' });
      }
      await kv.set(DATA_KEY, req.body);
      console.log('[API /api/data] Successfully saved data to KV.');
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).setHeader('Allow', ['GET', 'POST']).end('Method Not Allowed');
  } catch (error) {
    console.error('[API /api/data] KV operation failed:', error);
    return res.status(500).json({ error: 'A server error occurred while accessing data.' });
  }
}
