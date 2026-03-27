const Airtable = require('airtable');

function getBase() {
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );
}

async function fetchAllRecords(tableName, options = {}) {
  const base = getBase();
  const records = [];
  
  await base(tableName)
    .select({
      maxRecords: options.maxRecords || 1000,
      ...(options.filterByFormula && { filterByFormula: options.filterByFormula }),
      ...(options.sort && { sort: options.sort }),
    })
    .eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach((record) => {
        records.push({
          id: record.id,
          ...record.fields,
        });
      });
      fetchNextPage();
    });

  return records;
}

async function getProducts() {
  return fetchAllRecords('PRODUCTS');
}

async function getOffers() {
  return fetchAllRecords('OFFERS', {
    sort: [{ field: 'CommerceRank', direction: 'desc' }],
  });
}

async function getVendors() {
  return fetchAllRecords('VENDORS');
}

async function getCategories() {
  return fetchAllRecords('CATEGORIES');
}

async function getIntents() {
  return fetchAllRecords('INTENTS');
}

async function getOffersForProduct(productId) {
  return fetchAllRecords('OFFERS', {
    filterByFormula: `{product_id} = "${productId}"`,
    sort: [{ field: 'CommerceRank', direction: 'desc' }],
  });
}

async function getBestOffers() {
  return fetchAllRecords('OFFERS', {
    filterByFormula: `{is_best_offer} = TRUE()`,
    sort: [{ field: 'CommerceRank', direction: 'desc' }],
  });
}

async function getAllData() {
  const [products, offers, vendors, categories, intents] = await Promise.all([
    getProducts(),
    getOffers(),
    getVendors(),
    getCategories(),
    getIntents(),
  ]);

  // Build lookup maps
  const vendorMap = {};
  vendors.forEach((v) => {
    vendorMap[v.id] = v;
  });

  const productMap = {};
  products.forEach((p) => {
    productMap[p.id] = p;
  });

  // Enrich offers with vendor and product data
  const enrichedOffers = offers.map((offer) => {
    const vendorIds = offer.vendor_id || [];
    const productIds = offer.product_id || [];
    return {
      ...offer,
      vendor: vendorIds[0] ? vendorMap[vendorIds[0]] : null,
      product: productIds[0] ? productMap[productIds[0]] : null,
    };
  });

  return { products, offers: enrichedOffers, vendors, categories, intents, vendorMap, productMap };
}

module.exports = {
  getProducts,
  getOffers,
  getVendors,
  getCategories,
  getIntents,
  getOffersForProduct,
  getBestOffers,
  getAllData,
};
