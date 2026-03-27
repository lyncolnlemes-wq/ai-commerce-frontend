import { formatBRL, formatRank, trustLabel, parseSpecsJson } from '../lib/utils';

function ScoreBar({ value, color }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div className="score-bar">
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${pct}%`, background: color || 'var(--accent-green)' }}
        />
      </div>
      <span className="score-bar-value">{formatRank(value || 0)}</span>
    </div>
  );
}

function TrustDot({ score }) {
  let cls = 'trust-low';
  if (score >= 0.8) cls = 'trust-high';
  else if (score >= 0.5) cls = 'trust-mid';
  return (
    <span className="trust-indicator">
      <span className={`trust-dot ${cls}`} />
      {trustLabel(score)}
    </span>
  );
}

function SpecsDisplay({ specsStr }) {
  const specs = parseSpecsJson(specsStr);
  const entries = Object.entries(specs);
  if (entries.length === 0) return null;

  const labels = {
    ram_gb: 'RAM',
    storage_gb: 'Armazenamento',
    storage_type: 'Tipo',
    screen_inches: 'Tela',
    cpu: 'Processador',
    cpu_gen: 'Geração',
    plan: 'Plano',
    users: 'Usuários',
    billing: 'Cobrança',
  };

  const units = {
    ram_gb: 'GB',
    storage_gb: 'GB',
    screen_inches: '"',
    cpu_gen: 'ª gen',
  };

  return (
    <div className="specs-grid">
      {entries.map(([key, val]) => (
        <div key={key} className="spec-item">
          <div className="spec-label">{labels[key] || key}</div>
          <div className="spec-value">
            {val}
            {units[key] || ''}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AgentDecisionRecord({ question, bestOffer, alternatives, product }) {
  if (!bestOffer) return null;

  return (
    <article className="adr" itemScope itemType="https://schema.org/Product">
      {/* QUESTION */}
      <section className="adr-section adr-section--question">
        <div className="adr-label">Pergunta</div>
        <h2>{question}</h2>
      </section>

      {/* BEST OPTION */}
      <section className="adr-section adr-section--best">
        <div className="adr-label">✦ Melhor Opção — CommerceRank {formatRank(bestOffer.CommerceRank)}</div>
        <div className="product-name" itemProp="name">
          {product?.normalized_name || product?.name || bestOffer.product?.name || 'Produto'}
        </div>
        <div className="product-price" itemProp="price">
          {formatBRL(bestOffer.price)}
        </div>
        {bestOffer.vendor && (
          <div style={{ marginTop: 'var(--space-sm)' }}>
            <TrustDot score={bestOffer.vendor.trust_score} />
            <span style={{ marginLeft: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              via {bestOffer.vendor.vendor_name}
            </span>
          </div>
        )}
        {product?.specs_json && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <SpecsDisplay specsStr={product.specs_json} />
          </div>
        )}
      </section>

      {/* WHY */}
      <section className="adr-section adr-section--why">
        <div className="adr-label">Por que esta opção?</div>
        <p>{bestOffer.decision_reason || product?.decision_summary || 'Melhor combinação de preço, confiança do vendedor e disponibilidade.'}</p>
        <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
          <div>
            <div className="adr-label" style={{ marginBottom: '4px' }}>CommerceRank</div>
            <ScoreBar value={bestOffer.CommerceRank} color="var(--accent-green)" />
          </div>
          <div>
            <div className="adr-label" style={{ marginBottom: '4px' }}>Trust Score</div>
            <ScoreBar value={bestOffer.vendor?.trust_score} color="var(--accent-blue)" />
          </div>
          <div>
            <div className="adr-label" style={{ marginBottom: '4px' }}>Dados Completos</div>
            <ScoreBar value={bestOffer.data_completeness_score} color="var(--accent-purple)" />
          </div>
        </div>
      </section>

      {/* ALTERNATIVES */}
      {alternatives && alternatives.length > 0 && (
        <section className="adr-section adr-section--alternatives">
          <div className="adr-label">Alternativas ({alternatives.length})</div>
          {alternatives.map((alt, i) => (
            <div key={i} className="alt-row">
              <span className="alt-name">
                {alt.product?.normalized_name || alt.product?.name || `Oferta #${i + 2}`}
              </span>
              <span className="alt-vendor">
                {alt.vendor?.vendor_name || '—'}
              </span>
              <span className="alt-price">{formatBRL(alt.price)}</span>
              <span className="alt-score">
                {formatRank(alt.CommerceRank)}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* BUY */}
      <section className="adr-section adr-section--buy">
        <div className="adr-label">Ação</div>
        {bestOffer.affiliate_link ? (
          <a
            href={bestOffer.affiliate_link}
            className="buy-button"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            Comprar — {formatBRL(bestOffer.price)} →
          </a>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
            Link de compra indisponível
          </span>
        )}
        {bestOffer.risk_flag && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <span className="badge badge--orange">⚠ Atenção: dados incompletos ou vendor com baixa confiança</span>
          </div>
        )}
      </section>
    </article>
  );
}
