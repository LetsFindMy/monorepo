// Define the structure of our allowed types, grouped by Strapi model
const taxonomyMapping = {
  BRAND: {
    brands: '',
    artists: 'artist',
    authors: 'author',
    influencers: 'influencer',
    musicians: 'musician',
    painters: 'painter',
    retailers: 'retailer',
    studios: 'studio',
    teams: 'team',
  },
  CAST: {
    cast: 'story-cast',
  },
  COLLECTION: {
    collaborations: 'collaboration',
    platforms: 'platform',
    productLines: 'productLine',
    users: 'user',
  },
  EVENT: {
    entertainments: 'entertainment',
    events: 'event',
    festivals: 'festival',
    holidays: 'holiday',
    others: 'other',
  },
  FANDOM: {
    fandoms: 'fandom',
  },
  LOCATION: {
    locations: 'location',
    lodgings: 'lodging',
    places: 'place',
    restaurants: 'restaurant',
    ships: 'ship',
    themeParks: 'themePark',
  },
  META: {
    attractions: 'attraction',
    colors: 'color',
    materials: 'material',
    tags: 'tag',
    things: 'thing',
  },
  PRODUCT_CATEGORY: {
    adults: 'adults',
    baby: 'baby',
    everyday: 'everyday',
    home: 'home',
    kids: 'kids',
    'toys-games': 'toys-games',
  },
  STORY: {
    stories: 'story',
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
