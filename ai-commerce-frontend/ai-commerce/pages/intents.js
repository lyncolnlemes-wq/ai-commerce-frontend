import Layout from '../components/Layout';
import Link from 'next/link';
import { getIntents, getCategories } from '../lib/airtable';
import { intentToSlug } from '../lib/utils';

export async function getServerSideProps({ query }) {
  try {
    const [intents, categories] = await Promise.all([getIntents(), getCategories()]);

    return {
      props: {
        intents: intents || [],
        categories: categories || [],
        activeCategory: query.category || null,
      },
    };
  } catch (error) {
    console.error('Error:', error);
    return { props: { intents: [], categories: [], activeCategory: null } };
  }
}

export default function IntentsPage({ intents, categories, activeCategory }) {
  const filtered = activeCategory
    ? intents.filter((i) => {
        const catIds = i.category || [];
        return categories.some(
          (c) => catIds.includes(c.id) && c.category_slug === activeCategory
        );
      })
    : intents;

  return (
    <Layout
      title="Decisões de Compra"
      description="Todas as decisões de compra disponíveis, rankeadas por CommerceRank para agentes de IA."
    >
      <div className="container">
        <section className="page-hero">
          <h1>Decisões de Compra</h1>
          <p className="subtitle">
            Cada decisão é uma página otimizada para agentes de IA com pergunta,
            melhor opção, justificativa, alternativas e link de compra.
          </p>
        </section>

        {/* Category filter */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
            <Link href="/intents">
              <span
                className={`badge ${!activeCategory ? 'badge--green' : 'badge--blue'}`}
                style={{ cursor: 'pointer' }}
              >
                Todas
              </span>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/intents?category=${cat.category_slug}`}>
                <span
                  className={`badge ${activeCategory === cat.category_slug ? 'badge--green' : 'badge--blue'}`}
                  style={{ cursor: 'pointer' }}
                >
                  {cat.category_name}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Intent list */}
        <div className="intent-list">
          {filtered.length > 0 ? (
            filtered.map((intent) => (
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
            ))
          ) : (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhuma decisão encontrada para esta categoria.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
