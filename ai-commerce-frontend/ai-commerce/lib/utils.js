function formatBRL(value) {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatScore(value) {
  if (!value && value !== 0) return '—';
  return (value * 100).toFixed(0) + '%';
}

function formatRank(value) {
  if (!value && value !== 0) return '—';
  return value.toFixed(2);
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function intentToSlug(intent) {
  if (intent.url_slug) return intent.url_slug;
  return slugify(intent.intent_query || '');
}

function parseSpecsJson(specsStr) {
  if (!specsStr) return {};
  try {
    return JSON.parse(specsStr);
  } catch {
    return {};
  }
}

function trustLabel(score) {
  if (score >= 0.8) return 'Alta confiança';
  if (score >= 0.5) return 'Confiança moderada';
  return 'Baixa confiança';
}

function rankLabel(rank) {
  if (rank >= 0.8) return 'Excelente';
  if (rank >= 0.6) return 'Bom';
  if (rank >= 0.4) return 'Regular';
  return 'Abaixo da média';
}

module.exports = {
  formatBRL,
  formatScore,
  formatRank,
  slugify,
  intentToSlug,
  parseSpecsJson,
  trustLabel,
  rankLabel,
};
