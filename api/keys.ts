
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { mode } = req.query;

  let apiKey: string | undefined;

  if (mode === 'guest') {
    apiKey = process.env.PUBLIC_GUEST_API_KEY;
  } else if (mode === 'premium') {
    apiKey = process.env.PREMIUM_API_KEY;
  } else {
    return res.status(400).json({ error: "Invalid mode specified. Use 'guest' or 'premium'." });
  }

  if (!apiKey) {
    return res.status(500).json({ error: `API Key for mode '${mode}' is not configured on the server.` });
  }

  return res.status(200).json({ apiKey });
}
