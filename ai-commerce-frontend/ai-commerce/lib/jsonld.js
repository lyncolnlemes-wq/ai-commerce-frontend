function generateProductJsonLd(product, offers, siteUrl) {
  const bestOffer = offers.find((o) => o.is_best_offer) || offers[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.normalized_name || product.name,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    model: product.model || undefined,
    description: product.decision_summary || '',
    offers: offers.map((offer) => ({
      '@type': 'Offer',
      price: offer.price,
      priceCurrency: offer.currency || 'BRL',
      availability: offer.availability
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: offer.vendor
        ? { '@type': 'Organization', name: offer.vendor.vendor_name }
        : undefined,
      url: offer.affiliate_link || undefined,
    })),
    review: bestOffer
      ? {
          '@type': 'Review',
          reviewBody: bestOffer.decision_reason || '',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: ((bestOffer.CommerceRank || 0) * 5).toFixed(1),
            bestRating: '5',
          },
          author: {
            '@type': 'Organization',
            name: 'AI Commerce Search Engine',
          },
        }
      : undefined,
  };
}

function generateIntentJsonLd(intent, bestProduct, offers, siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: intent.intent_query,
        acceptedAnswer: {
          '@type': 'Answer',
          text: intent.decision_reason || '',
        },
      },
    ],
  };
}

function generateBreadcrumbJsonLd(items, siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

module.exports = {
  generateProductJsonLd,
  generateIntentJsonLd,
  generateBreadcrumbJsonLd,
};
