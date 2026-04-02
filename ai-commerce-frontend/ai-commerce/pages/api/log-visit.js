export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.ID_BASE_AIRTABLE;
  const TABLE_NAME = 'VISIT_LOG';

  if (!AIRTABLE_API_KEY || !BASE_ID) {
    return res.status(500).json({ error: 'Airtable not configured' });
  }

  const { path, user_agent, referer } = req.body || {};

  const ua = user_agent || req.headers['user-agent'] || '';
  const ref = referer || req.headers['referer'] || '';
  const visitPath = path || '/';

  const botPatterns = /bot|crawler|spider|scraper|curl|wget|python|java|ruby|perl|go-http/i;
  const is_bot = botPatterns.test(ua);

  // Simple agent name detection
  let agent_name = 'browser';
  if (/googlebot/i.test(ua)) agent_name = 'Googlebot';
  else if (/bingbot/i.test(ua)) agent_name = 'Bingbot';
  else if (/claude/i.test(ua)) agent_name = 'Claude';
  else if (/gpt|openai/i.test(ua)) agent_name = 'GPT';
  else if (/curl/i.test(ua)) agent_name = 'curl';
  else if (/python/i.test(ua)) agent_name = 'Python';
  else if (is_bot) agent_name = 'bot';

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            path: visitPath,
            user_agent: ua,
            agent_name,
            is_bot,
            referer: ref,
            visited_at: new Date().toISOString(),
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Airtable VISIT_LOG error:', err);
      return res.status(500).json({ error: 'Failed to log visit' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('log-visit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
