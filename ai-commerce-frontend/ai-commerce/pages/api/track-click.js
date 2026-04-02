export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { offer_id, user_agent, referer } = req.body || {};

  if (!offer_id) {
    return res.status(400).json({ error: 'offer_id is required' });
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.ID_BASE_AIRTABLE;
  const TABLE_NAME = 'CLICK_LOG';

  if (!AIRTABLE_API_KEY || !BASE_ID) {
    return res.status(500).json({ error: 'Airtable not configured' });
  }

  const ua = user_agent || req.headers['user-agent'] || '';
  const ref = referer || req.headers['referer'] || '';

  const botPatterns = /bot|crawler|spider|scraper|curl|wget|python|java|ruby|perl|go-http/i;
  const is_bot = botPatterns.test(ua);

  try {
    // 1. Log the click
    const clickRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            offer_id: [offer_id],
            clicked_at: new Date().toISOString(),
            user_agent: ua,
            referer: ref,
            is_bot,
          },
        }),
      }
    );

    if (!clickRes.ok) {
      const err = await clickRes.text();
      console.error('Airtable CLICK_LOG error:', err);
      return res.status(500).json({ error: 'Failed to log click' });
    }

    // 2. Increment click_count in OFFERS table
    const offerRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/OFERTAS/${offer_id}`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      }
    );

    if (offerRes.ok) {
      const offerData = await offerRes.json();
      const currentCount = offerData.fields?.click_count || 0;

      await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/OFERTAS/${offer_id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: { click_count: currentCount + 1 },
          }),
        }
      );
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('track-click error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
