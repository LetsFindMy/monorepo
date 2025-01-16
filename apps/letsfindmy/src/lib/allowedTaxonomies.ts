// Define the structure of our allowed types, grouped by Strapi model
const taxonomyMapping = {
  META: {
    attractions: 'attraction',
    things: 'thing',
    tags: 'tag',
    colors: 'color',
    materials: 'material',
  },
  EVENT: {
    events: 'event',
    entertainments: 'entertainment',
    holidays: 'holiday',
    festivals: 'festival',
    others: 'other',
  },
  LOCATION: {
    locations: 'location',
    places: 'place',
    themeParks: 'themePark',
    lodgings: 'lodging',
    ships: 'ship',
    restaurants: 'restaurant',
  },
  BRAND: {
    retailers: 'retailer',
    musicians: 'musician',
    authors: 'author',
    artists: 'artist',
    painters: 'painter',
    teams: 'team',
    influencers: 'influencer',
    studios: 'studio',
  },
  COLLECTION: {
    productLines: 'productLine',
    collaborations: 'collaboration',
    platforms: 'platform',
    users: 'user',
  },
  FANDOM: {
    fandoms: 'fandom',
  },
  PRODUCT_CATEGORY: {
    adults: 'adults',
    kids: 'kids',
    baby: 'baby',
    home: 'home',
    everyday: 'everyday',
    toysGames: 'toys-games',
  },
  CAST: {
    cast: 'story-cast',
  },
} as const;

type ModelKey = keyof typeof taxonomyMapping;
type RouteName = keyof (typeof taxonomyMapping)[ModelKey];
type StrapiType = (typeof taxonomyMapping)[ModelKey][RouteName];

const ALLOWED_TAXONOMIES = Object.values(taxonomyMapping).flatMap(
  Object.keys,
) as RouteName[];

function isAllowedTaxonomy(type: string): type is RouteName {
  return ALLOWED_TAXONOMIES.includes(type as RouteName);
}

function getModelKey(routeName: RouteName): ModelKey {
  for (const [key, value] of Object.entries(taxonomyMapping)) {
    if (routeName in value) {
      return key as ModelKey;
    }
  }
  throw new Error(`Invalid route name: ${routeName}`);
}

function routeNameToStrapiType(routeName: RouteName): StrapiType {
  const modelKey = getModelKey(routeName);
  return taxonomyMapping[modelKey][routeName];
}

function strapiTypeToRouteName(strapiType: StrapiType): RouteName {
  for (const [modelKey, mappings] of Object.entries(taxonomyMapping)) {
    const entry = Object.entries(mappings).find(
      ([_, value]) => value === strapiType,
    );
    if (entry) {
      return entry[0] as RouteName;
    }
  }
  throw new Error(`Invalid Strapi type: ${strapiType}`);
}

export {
  taxonomyMapping,
  ALLOWED_TAXONOMIES,
  isAllowedTaxonomy,
  getModelKey,
  routeNameToStrapiType,
  strapiTypeToRouteName,
};

export type { ModelKey, RouteName, StrapiType };
