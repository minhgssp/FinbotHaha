

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[API /api/keys] Received request.');
  if (req.method !== 'GET') {
    console.error('[API /api/keys] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { mode } = req.query;
  console.log(`[API /api/keys] Requested mode: '${mode}'`);

  let apiKey: string | undefined;

  if (mode === 'guest') {
    apiKey = process.env.PUBLIC_GUEST_API_KEY;
    console.log(`[API /api/keys] Checking env var 'PUBLIC_GUEST_API_KEY'. Found: ${!!apiKey}`);
  } else if (mode === 'premium') {
    apiKey = process.env.PREMIUM_API_KEY;
    console.log(`[API /api/keys] Checking env var 'PREMIUM_API_KEY'. Found: ${!!apiKey}`);
  } else {
    console.error(`[API /api/keys] Invalid mode provided: ${mode}`);
    return res.status(400).json({ error: "Invalid mode specified. Use 'guest' or 'premium'." });
  }

  if (!apiKey) {
    console.error(`[API /api/keys] API Key for mode '${mode}' is MISSING in environment variables.`);
    return res.status(500).json({ error: `API Key for mode '${mode}' is not configured on the server.` });
  }

  console.log(`[API /api/keys] Successfully found API key for mode '${mode}'. Sending response.`);
  return res.status(200).json({ apiKey });
}