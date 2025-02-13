// apps/cms/src/api/jollyroger/controllers/schemas.ts
import { z } from 'zod';

const nullableString = z.string().nullish();
const nullableNumber = z.number().nullish();
const nullableBoolean = z.boolean().nullish();
const nullableUrl = z.string().url().nullish();
const nullableStringArray = z.array(z.string()).nullish();

export const VariantSchema = z.object({
  name: nullableString,
  asin: nullableString,
  price: nullableNumber,
  currency: nullableString,
  unit_price: nullableNumber,
});

export const FormatSchema = z.object({
  name: nullableString,
  price: nullableNumber,
  url: nullableUrl,
});

export type Variant = z.infer<typeof VariantSchema>;
export type Format = z.infer<typeof FormatSchema>;

export const ProductSchema = z
  .object({
    title: nullableString,
    seller_name: nullableString,
    brand: nullableString,
    description: nullableString,
    initial_price: nullableNumber,
    currency: nullableString,
    availability: nullableString,
    reviews_count: nullableNumber,
    categories: nullableStringArray,
    parent_asin: nullableString,
    asin: nullableString,
    buybox_seller: nullableString,
    number_of_sellers: nullableNumber,
    root_bs_rank: nullableNumber,
    answered_questions: nullableNumber,
    domain: nullableUrl,
    images_count: nullableNumber,
    url: nullableUrl,
    video_count: nullableNumber,
    image_url: nullableUrl,
    item_weight: nullableString,
    rating: nullableNumber,
    product_dimensions: nullableString,
    seller_id: nullableString,
    department: nullableString,
    plus_content: nullableBoolean,
    video: nullableBoolean,
    top_review: nullableString,
    final_price_high: nullableNumber,
    final_price: nullableNumber,
    delivery: nullableStringArray,
    variations: z.array(VariantSchema).nullish(),
    format: z.array(FormatSchema).nullish(),
    buybox_prices: z.preprocess(
      (value) => {
        if (value && typeof value === 'object') {
          const obj = value as Record<string, unknown>;
          const finalPrice = obj.final_price;
          if (typeof finalPrice === 'number') {
            return { final_price: finalPrice };
          }
        }
        return undefined;
      },
      z.object({ final_price: z.number() }).optional(),
    ),
    input_asin: nullableString,
    origin_url: nullableUrl,
    is_available: nullableBoolean,
    root_bs_category: nullableString,
    bs_category: nullableString,
    bs_rank: nullableNumber,
    badge: nullableString,
    subcategory_rank: z
      .array(
        z.object({
          subcategory_name: nullableString,
          subcategory_rank: nullableNumber,
        }),
      )
      .nullish(),
    amazon_choice: nullableBoolean,
    images: nullableStringArray,
    product_details: z
      .array(
        z.object({
          type: nullableString,
          value: z.unknown().nullish(),
        }),
      )
      .nullish(),
    prices_breakdown: z
      .object({
        typical_price: nullableNumber,
        list_price: nullableNumber,
        deal_type: nullableString,
      })
      .nullish(),
    country_of_origin: nullableString,
    from_the_brand: z.unknown().nullish(),
    product_description: z.union([
      nullableString,
      z
        .array(
          z.object({
            url: nullableUrl,
            type: nullableString,
          }),
        )
        .nullish(),
    ]),
    seller_url: nullableUrl,
    customer_says: nullableString,
    sustainability_features: z.unknown().nullish(),
    climate_pledge_friendly: nullableBoolean,
    videos: z.union([nullableStringArray, z.null()]),
    other_sellers_prices: z
      .array(
        z.object({
          price: nullableNumber,
          price_per_unit: nullableNumber,
          unit: nullableString,
          delivery: nullableString,
          seller_name: nullableString,
          seller_url: nullableUrl,
          seller_rating: nullableNumber,
          ships_from: nullableString,
          num_of_ratings: nullableNumber,
        }),
      )
      .nullish(),
    downloadable_videos: z.union([nullableStringArray, z.null()]),
    timestamp: z.string().datetime().nullish(),
    input: z
      .object({
        asin: nullableString,
        url: nullableUrl,
        origin_url: nullableUrl,
      })
      .nullish(),
    discovery_input: z
      .object({
        keyword: nullableString,
      })
      .nullish(),
  })
  .partial()
  .optional();

export type Product = z.infer<typeof ProductSchema>;
