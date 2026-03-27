import Layout from '../../components/Layout';
import AgentDecisionRecord from '../../components/AgentDecisionRecord';
import { getAllData } from '../../lib/airtable';
import { intentToSlug } from '../../lib/utils';
import { generateIntentJsonLd, generateProductJsonLd, generateBreadcrumbJsonLd } from '../../lib/jsonld';

export async function getServerSideProps({ params }) {
  try {
    const { slug } = params;
    const { intents, offers, products, productMap } = await getAllData();

    // Find intent by slug
    const intent = intents.find((i) => intentToSlug(i) === slug);

    if (!intent) {
      return { notFound: true };
    }

    // Get the decision product
    const decisionProductIds = intent.decision_product_id || [];
    const decisionProduct = decisionProductIds[0] ? productMap[decisionProductIds[0]] : null;

    // Get offers for this category/intent
    const categoryIds = intent.category || [];
    let relevantOffers = offers.filter((o) => {
      if (decisionProduct && o.product_id && o.product_id.includes(decisionProduct.id)) {
        return true;
      }
      return false;
    });

    // If no direct match, get best offers overall
    if (relevantOffers.length === 0) {
      relevantOffers = offers
        .filter((o) => o.is_best_offer)
        .slice(0, 5);
    }

    // Sort by CommerceRank
    relevantOffers.sort((a, b) => (b.CommerceRank || 0) - (a.CommerceRank || 0));

    const bestOffer = relevantOffers[0] || null;
    const alternatives = relevantOffers.slice(1, 6);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    // Build JSON-LD
    const jsonLd = [
      generateIntentJsonLd(intent, decisionProduct, relevantOffers, siteUrl),
      decisionProduct
        ? generateProductJsonLd(decisionProduct, relevantOffers, siteUrl)
        : null,
      generateBreadcrumbJsonLd(
        [
          { name: 'Início', url: '/' },
          { name: 'Decisões', url: '/intents' },
          { name: intent.intent_query, url: `/intent/${slug}` },
        ],
        siteUrl
      ),
    ].filter(Boolean);

    return {
      props: {
        intent,
        bestOffer,
        alternatives,
        product: decisionProduct,
        jsonLd,
        slug,
      },
    };
  } catch (error) {
    console.error('Error fetching intent:', error);
    return { notFound: true };
  }
}

export default function IntentPage({ intent, bestOffer, alternatives, product, jsonLd, slug }) {
  return (
    <Layout
      title={intent.intent_query}
      description={intent.decision_reason || `Decisão de compra: ${intent.intent_query}`}
      jsonLd={jsonLd}
    >
      <div className="container">
        <section className="page-hero">
          <div style={{ marginBottom: 'var(--space-sm)' }}>
            <span className="badge badge--green">Agent Decision Record</span>
            {intent.use_case && (
              <span className="badge badge--blue" style={{ marginLeft: '8px' }}>
                {intent.use_case}
              </span>
            )}
          </div>
          <h1>{intent.intent_query}</h1>
          {intent.decision_reason && (
            <p className="subtitle">{intent.decision_reason}</p>
          )}
        </section>

        <AgentDecisionRecord
          question={intent.intent_query}
          bestOffer={bestOffer}
          alternatives={alternatives}
          product={product}
        />

        {/* Machine-readable summary (visible to agents scraping HTML) */}
        <section
          style={{ marginTop: 'var(--space-xl)' }}
          aria-label="Resumo para agentes"
        >
          <div className="section-title">Dados Estruturados</div>
          <div className="card" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <p>Esta página contém dados estruturados em JSON-LD para consumo por agentes de IA.</p>
            <p style={{ marginTop: 'var(--space-sm)' }}>
              Endpoint JSON: <a href={`/api/intent/${slug}`}>/api/intent/{slug}</a>
            </p>
            <p style={{ marginTop: 'var(--space-sm)' }}>
              Atualizado em: {intent.last_updated || new Date().toISOString().split('T')[0]}
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
