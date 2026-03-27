import { getAllData } from '../../../lib/airtable';
import { intentToSlug } from '../../../lib/utils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  try {
    const { intents, offers, productMap } = await getAllData();

    const intent = intents.find((i) => intentToSlug(i) === slug);

    if (!intent) {
      return res.status(404).json({ error: 'Intent not found' });
    }

    const decisionProductIds = intent.decision_product_id || [];
    const product = decisionProductIds[0] ? productMap[decisionProductIds[0]] : null;

    const productOffers = product
      ? offers
          .filter((o) => (o.product_id || []).includes(product.id))
          .sort((a, b) => (b.CommerceRank || 0) - (a.CommerceRank || 0))
      : [];

    const bestOffer = productOffers[0] || null;
    const alternatives = productOffers.slice(1);

    const result = {
      meta: {
        engine: 'AI Commerce Search Engine',
        version: '1.0',
        updated_at: new Date().toISOString(),
      },
      intent: {
        query: intent.intent_query,
        slug: intentToSlug(intent),
        use_case: intent.use_case || null,
        price_range: {
          min: intent.price_range_min || null,
          max: intent.price_range_max || null,
        },
      },
      decision: {
        product: product
          ? {
              name: product.normalized_name || product.name,
              brand: product.brand || null,
              model: product.model || null,
              specs: product.specs_json ? JSON.parse(product.specs_json) : null,
              summary: product.decision_summary || null,
            }
          : null,
        best_offer: bestOffer
          ? {
              price: bestOffer.price,
              currency: bestOffer.currency || 'BRL',
              vendor: bestOffer.vendor?.vendor_name || null,
              trust_score: bestOffer.vendor?.trust_score || null,
              commerce_rank: bestOffer.CommerceRank || null,
              reason: bestOffer.decision_reason || null,
              available: !!bestOffer.availability,
              delivery_days: bestOffer.delivery_days || null,
              affiliate_link: bestOffer.affiliate_link || null,
              risk_flag: !!bestOffer.risk_flag,
            }
          : null,
        alternatives: alternatives.map((alt) => ({
          price: alt.price,
          vendor: alt.vendor?.vendor_name || null,
          commerce_rank: alt.CommerceRank || null,
          available: !!alt.availability,
          affiliate_link: alt.affiliate_link || null,
        })),
      },
    };

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch intent', message: error.message });
  }
}
