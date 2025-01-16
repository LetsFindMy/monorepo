import {
  RouteName,
  isAllowedTaxonomy,
  routeNameToStrapiType,
  getModelKey,
} from './allowedTaxonomies';
import { getMetas, getMeta } from '#/lib/actions/metas';
import { getEvents, getEvent } from '#/lib/actions/events';
import { getLocations, getLocation } from '#/lib/actions/locations';
import { getBrands, getBrand } from '#/lib/actions/brands';
import { getCollections, getCollection } from '#/lib/actions/collections';
import { getFandoms, getFandom } from '#/lib/actions/fandoms';
import {
  getProductCategories,
  getProductCategory,
} from '#/lib/actions/productCategories';
import { getStories, getStory } from '#/lib/actions/stories';
import { getCast, getCastMember } from '#/lib/actions/cast';

type TaxonomyData = {
  data: any;
  meta: any;
};

export async function getTaxonomyData(
  taxonomy: string,
  slug?: string,
): Promise<TaxonomyData> {
  if (!isAllowedTaxonomy(taxonomy)) {
    throw new Error(`Invalid taxonomy: ${taxonomy}`);
  }

  const modelKey = getModelKey(taxonomy as RouteName);
  const strapiType = routeNameToStrapiType(taxonomy as RouteName);

  switch (modelKey) {
    case 'EVENT':
      return slug ? await getEvent(slug) : await getEvents();
    case 'META':
      return slug
        ? await getMeta(slug, strapiType)
        : await getMetas(strapiType);
    case 'LOCATION':
      return slug
        ? await getLocation(slug, strapiType)
        : await getLocations(strapiType);
    case 'BRAND':
      return slug
        ? await getBrand(slug, strapiType)
        : await getBrands(strapiType);
    case 'COLLECTION':
      return slug
        ? await getCollection(slug, strapiType)
        : await getCollections(strapiType);
    case 'FANDOM':
      return slug ? await getFandom(slug) : await getFandoms();
    case 'PRODUCT_CATEGORY':
      return slug
        ? await getProductCategory(slug, strapiType)
        : await getProductCategories(strapiType);
    case 'CAST':
      return slug ? await getCastMember(slug) : await getCast();
    default:
      throw new Error(`Unhandled model key: ${modelKey}`);
  }
}
