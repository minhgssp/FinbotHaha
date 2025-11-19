

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
  let envVarName: string = '';

  if (mode === 'guest') {
    envVarName = 'PUBLIC_GUEST_API_KEY';
    apiKey = process.env[envVarName];
    console.log(`[API /api/keys] Checking env var '${envVarName}'. Value is defined: ${!!apiKey}. Length: ${apiKey?.length ?? 0}`);
  } else if (mode === 'premium') {
    envVarName = 'PREMIUM_API_KEY';
    apiKey = process.env[envVarName];
    console.log(`[API /api/keys] Checking env var '${envVarName}'. Value is defined: ${!!apiKey}. Length: ${apiKey?.length ?? 0}`);
  } else {
    console.error(`[API /api/keys] Invalid mode provided: ${mode}`);
    return res.status(400).json({ error: "Invalid mode specified. Use 'guest' or 'premium'." });
  }

  if (!apiKey || apiKey.trim() === '') {
    console.error(`[API /api/keys] API Key for mode '${mode}' (from env var '${envVarName}') is MISSING or EMPTY in environment variables.`);
    // We still return 200 OK but with an empty key, so the client can handle it gracefully.
    // Returning a 500 might be confusing if the service itself is fine.
    return res.status(200).json({ apiKey: '' });
  }

  console.log(`[API /api/keys] Successfully found API key for mode '${mode}'. Sending response.`);
  return res.status(200).json({ apiKey });
}
