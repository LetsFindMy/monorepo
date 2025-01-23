export type MediaType =
  | 'hardcover'
  | 'softcover'
  | 'otherBook'
  | 'digitalBookOther'
  | 'audible'
  | 'kindle';

export interface ProductVariantData {
  asin: string;
  media_type: MediaType;
}

export interface CrosscheckData {
  asin: string;
  product_variants: {
    connect: string[];
  };
}

export interface ProductPDPData {
  name: string;
  apiRawData: any;
  price_high: number;
  price_sale: number | null;
  sold_by: string;
  product_variants: {
    connect: string[];
  };
  urls: Array<{
    url: string;
    isCanonical: boolean;
    urlStatus: string;
  }>;
  copy: {
    full_markdown: string;
  };
}

export interface AmazonFormat {
  name: string;
  url: string;
}

export interface AmazonData {
  title: string;
  asin: string;
  format: AmazonFormat[];
  description: string;
  url: string;
  upc?: string;
  initial_price: number;
  final_price_high?: number;
  final_price?: number;
}
