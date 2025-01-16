// Define the structure of our allowed types
const allowedTypes = {
  LOCATION: ['locations', 'places'] as const,
  META: ['attractions', 'things', 'tags', 'colors', 'materials'] as const
} as const;

// Create a type for the keys of allowedTypes (i.e., 'LOCATION' | 'META')
type ModelKey = keyof typeof allowedTypes;

// Create a type that represents all possible values across all models
type AllowedType = typeof allowedTypes[ModelKey][number];

// Function to check if a type is allowed for a specific model
function isAllowedTypeForModel(type: string, model: ModelKey): type is AllowedType {
  return (allowedTypes[model] as readonly string[]).includes(type);
}

// Function to check if a type is allowed across all models
function isAllowedType(type: string): type is AllowedType {
  return Object.values(allowedTypes).flat().includes(type as any);
}

// Get all allowed types as a flat array
const ALLOWED_TAXONOMIES = Object.values(allowedTypes).flat() as AllowedType[];

// Function to get types for a specific model (if needed externally)
function getTypesForModel(model: ModelKey): readonly string[] {
  return allowedTypes[model];
}

// Function to convert taxonomy to collection
function taxonomyToCollection(taxonomy: string): ModelKey {
  const singularTaxonomy = taxonomy.endsWith('s') ? taxonomy.slice(0, -1) : taxonomy;

  for (const [collection, taxonomies] of Object.entries(allowedTypes)) {
    if (taxonomies.some(t => t === taxonomy || t === singularTaxonomy + 's')) {
      return collection as ModelKey;
    }
  }

  throw new Error(`Invalid taxonomy: ${taxonomy}. Allowed taxonomies are: ${ALLOWED_TAXONOMIES.join(', ')}`);
}

export {
  allowedTypes,
  ALLOWED_TAXONOMIES,
  isAllowedType,
  isAllowedTypeForModel,
  getTypesForModel,
  taxonomyToCollection
};

export type {
  ModelKey,
  AllowedType
};

