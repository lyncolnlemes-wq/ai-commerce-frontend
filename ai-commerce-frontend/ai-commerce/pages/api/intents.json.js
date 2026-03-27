import { getAllData } from '../../lib/airtable';
import { intentToSlug } from '../../lib/utils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { intents, offers, productMap } = await getAllData();

    const result = {
      meta: {
        engine: 'AI Commerce Search Engine',
        version: '1.0',
        updated_at: new Date().toISOString(),
        total_intents: intents.length,
      },
      intents: intents.map((intent) => {
        const decisionProductIds = intent.decision_product_id || [];
        const product = decisionProductIds[0] ? productMap[decisionProductIds[0]] : null;

        const productOffers = product
          ? offers
              .filter((o) => (o.product_id || []).includes(product.id))
              .sort((a, b) => (b.CommerceRank || 0) - (a.CommerceRank || 0))
          : [];

        const bestOffer = productOffers[0] || null;

        return {
          query: intent.intent_query,
          slug: intentToSlug(intent),
          url: `/intent/${intentToSlug(intent)}`,
          use_case: intent.use_case || null,
          decision: {
            product: product
              ? {
                  name: product.normalized_name || product.name,
                  brand: product.brand || null,
                  model: product.model || null,
                }
              : null,
            reason: intent.decision_reason || null,
            best_price: bestOffer?.price || null,
            best_vendor: bestOffer?.vendor?.vendor_name || null,
            commerce_rank: bestOffer?.CommerceRank || null,
            affiliate_link: bestOffer?.affiliate_link || null,
          },
          alternatives_count: Math.max(0, productOffers.length - 1),
          last_updated: intent.last_updated || null,
        };
      }),
    };

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch intents', message: error.message });
  }
}
