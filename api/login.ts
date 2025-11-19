
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { password } = req.body;
  const premiumPassword = process.env.PREMIUM_PASSWORD;

  if (!premiumPassword) {
    return res.status(500).json({ error: 'Server configuration error: Premium password not set.' });
  }

  if (password === premiumPassword) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ error: 'Invalid password.' });
  }
}
