import Layout from '../components/Layout';
import Link from 'next/link';
import { getAllData } from '../lib/airtable';
import { formatBRL, formatRank, intentToSlug } from '../lib/utils';

export async function getServerSideProps() {
  try {
    const { products, offers, vendors, categories, intents } = await getAllData();

    const bestOffers = offers
      .filter((o) => o.is_best_offer)
      .slice(0, 10);

    return {
      props: {
        categories: categories || [],
        intents: intents || [],
        bestOffers: bestOffers || [],
        productCount: products.length,
        offerCount: offers.length,
        vendorCount: vendors.length,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        categories: [],
        intents: [],
        bestOffers: [],
        productCount: 0,
        offerCount: 0,
        vendorCount: 0,
      },
    };
  }
}

export default function Home({ categories, intents, bestOffers, productCount, offerCount, vendorCount }) {
  return (
    <Layout>
      <div className="container">
        {/* Hero */}
        <section className="page-hero">
          <h1>Decisões de compra<br />para agentes de IA</h1>
          <p className="subtitle">
            Motor de busca com {offerCount} ofertas de {vendorCount} vendors,
            rankeadas por CommerceRank. Dados estruturados, transparentes e
            otimizados para consumo por agentes.
          </p>
          <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <span className="badge badge--green">{productCount} produtos</span>
            <span className="badge badge--blue">{offerCount} ofertas</span>
            <span className="badge badge--orange">{vendorCount} vendors</span>
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <div className="section-title">Categorias</div>
            <div className="card-grid">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/intents?category=${cat.category_slug || ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="card">
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      /{cat.category_slug}
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                      {cat.category_name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Intents */}
        {intents.length > 0 && (
          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <div className="section-title">Decisões Disponíveis</div>
            <div className="intent-list">
              {intents.map((intent) => (
                <Link
                  key={intent.id}
                  href={`/intent/${intentToSlug(intent)}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="intent-item">
                    <span className="intent-arrow">→</span>
                    <span className="intent-query">{intent.intent_query}</span>
                    {intent.use_case && (
                      <span className="intent-meta">{intent.use_case}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Top Offers */}
        {bestOffers.length > 0 && (
          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <div className="section-title">Melhores Ofertas Agora</div>
            <div className="card-grid">
              {bestOffers.map((offer, i) => (
                <div key={i} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                    <span className="badge badge--green">BEST</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Rank {formatRank(offer.CommerceRank)}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {offer.product?.normalized_name || offer.product?.name || 'Produto'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-green)', marginBottom: 'var(--space-sm)' }}>
                    {formatBRL(offer.price)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    via {offer.vendor?.vendor_name || '—'}
                  </div>
                  {offer.affiliate_link && (
                    <a
                      href={offer.affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="buy-button"
                      style={{ marginTop: 'var(--space-md)', width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '10px' }}
                    >
                      Comprar →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* API info for agents */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="section-title">Para Agentes de IA</div>
          <div className="card" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
              Endpoints disponíveis para consumo programático:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <code style={{ color: 'var(--accent-green)' }}>GET /api/products.json</code>
              <span style={{ color: 'var(--text-muted)', paddingLeft: '16px' }}>→ Todos os produtos com ofertas e ranking</span>
              <code style={{ color: 'var(--accent-green)' }}>GET /api/intents.json</code>
              <span style={{ color: 'var(--text-muted)', paddingLeft: '16px' }}>→ Todas as decisões com melhores opções</span>
              <code style={{ color: 'var(--accent-green)' }}>GET /intent/[slug]</code>
              <span style={{ color: 'var(--text-muted)', paddingLeft: '16px' }}>→ Página com Agent Decision Record (HTML + JSON-LD)</span>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
