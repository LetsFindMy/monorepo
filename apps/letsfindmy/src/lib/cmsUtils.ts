export class StrapiUrlBuilder {
  #url: URL;

  constructor(model: string, slug?: string) {
    this.#url = new URL(`/api/${model}`, process.env.STRAPI_URL ?? '');
    slug && this.addFilter('slug', slug);
  }

  addPopulate(populate?: string | Record<string, unknown>) {
    if (!populate) return this;
    const populateValue = typeof populate === 'string'
      ? populate
      : JSON.stringify(populate);
    this.#url.searchParams.append('populate', populateValue);
    return this;
  }

  addFilter(field: string, value: string | number | boolean) {
    this.#url.searchParams.append(`filters[${field}][$eq]`, value.toString());
    return this;
  }

  addFields(fields?: string[] | readonly string[]) {
    if (!fields?.length) return this;
    this.#url.searchParams.append('fields', fields.join(','));
    return this;
  }

  addPagination(page?: number, pageSize?: number) {
    page && this.#url.searchParams.append('pagination[page]', page.toString());
    pageSize && this.#url.searchParams.append('pagination[pageSize]', pageSize.toString());
    return this;
  }

  toString() {
    return this.#url.toString();
  }
}

export async function fetchFromAPI<T>(url: string, tags: string[] = []) {
// Constants
const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const DEFAULT_REVALIDATE = 3600;


  if (!STRAPI_URL) {
    throw new Error('STRAPI_URL environment variable is not configured');
  }

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN ?? ''}`,
        accept: 'application/json',
      },
      next: {
        revalidate: DEFAULT_REVALIDATE,
        tags,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API request failed: ${res.status} - ${errorText}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    throw new Error(
      `API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}