import { getAllData } from '../../lib/airtable';
import { formatRank } from '../../lib/utils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { products, offers, vendors, categories } = await getAllData();

    const productMap = {};
    products.forEach((p) => {
      productMap[p.id] = {
        id: p.id,
        name: p.normalized_name || p.name,
        brand: p.brand || null,
        model: p.model || null,
        canonical_key: p.canonical_product_key || null,
        decision_summary: p.decision_summary || null,
        specs: p.specs_json ? JSON.parse(p.specs_json) : null,
        offers: [],
      };
    });

    offers.forEach((offer) => {
      const productIds = offer.product_id || [];
      const pid = productIds[0];
      if (pid && productMap[pid]) {
        productMap[pid].offers.push({
          price: offer.price,
          currency: offer.currency || 'BRL',
          available: !!offer.availability,
          delivery_days: offer.delivery_days || null,
          vendor: offer.vendor?.vendor_name || null,
          trust_score: offer.vendor?.trust_score || null,
          commerce_rank: offer.CommerceRank || 0,
          is_best: !!offer.is_best_offer,
          decision_reason: offer.decision_reason || null,
          risk_flag: !!offer.risk_flag,
          affiliate_link: offer.affiliate_link || null,
          data_completeness: offer.data_completeness_score || null,
        });
      }
    });

    // Sort offers within each product by rank
    Object.values(productMap).forEach((p) => {
      p.offers.sort((a, b) => b.commerce_rank - a.commerce_rank);
    });

    const result = {
      meta: {
        engine: 'AI Commerce Search Engine',
        version: '1.0',
        updated_at: new Date().toISOString(),
        total_products: products.length,
        total_offers: offers.length,
        total_vendors: vendors.length,
        categories: categories.map((c) => c.category_name),
      },
      products: Object.values(productMap).filter((p) => p.offers.length > 0),
    };

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch products', message: error.message });
  }
}
