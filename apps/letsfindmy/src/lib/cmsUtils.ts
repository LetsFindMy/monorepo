import qs from 'qs';

export class StrapiUrlBuilder {
  #baseUrl: string;
  #query: {
    populate?: unknown;
    fields?: string[];
    filters?: Record<string, unknown>;
    locale?: string;
    status?: 'published' | 'draft';
    sort?: string | string[];
    pagination?: {
      page?: number;
      pageSize?: number;
      withCount?: boolean;
    };
  };

  constructor(model: string) {
    this.#baseUrl = `${process.env.STRAPI_URL ?? ''}/api/${model}`;
    this.#query = {};
  }

  addPopulate(populate?: string | Record<string, unknown>) {
    if (populate) {
      this.#query.populate = populate;
    }
    return this;
  }

  addFields(fields?: string[] | readonly string[]) {
    if (fields?.length) {
      this.#query.fields = [...fields];
    }
    return this;
  }

  addFilter(field: string, value: string | number | boolean) {
    this.#query.filters = {
      ...this.#query.filters,
      [field]: { $eq: value },
    };
    return this;
  }

  addComplexFilter(filters: Record<string, unknown>) {
    this.#query.filters = {
      ...this.#query.filters,
      ...filters,
    };
    return this;
  }

  addPagination(page?: number, pageSize?: number, withCount = true) {
    if (page || pageSize) {
      this.#query.pagination = {
        ...(page && { page }),
        ...(pageSize && { pageSize }),
        withCount,
      };
    }
    return this;
  }

  addSort(sort: string | string[]) {
    this.#query.sort = sort;
    return this;
  }

  addLocale(locale: string) {
    this.#query.locale = locale;
    return this;
  }

  addStatus(status: 'published' | 'draft') {
    this.#query.status = status;
    return this;
  }

  getDebugQuery() {
    return {
      baseUrl: this.#baseUrl,
      query: this.#query,
      fullUrl: this.toString(),
    };
  }

  toString() {
    const queryString = qs.stringify(this.#query, {
      encodeValuesOnly: true, // don't encode the brackets
    });
    return `${this.#baseUrl}${queryString ? `?${queryString}` : ''}`;
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
      `API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { pagination: { total: number; pageCount: number } };
}

export async function fetchAllPages<T>(
  modelName: string,
  fields: readonly string[],
  batchSize: number = 100,
  additionalConfig: (builder: StrapiUrlBuilder) => StrapiUrlBuilder = (b) => b,
): Promise<T[]> {
  const allItems: T[] = [];

  const urlBuilder = new StrapiUrlBuilder(modelName)
    .addFields(fields)
    .addPagination(1, batchSize);

  additionalConfig(urlBuilder);

  const firstPage = await fetchFromAPI<PaginatedResponse<T>>(
    urlBuilder.toString(),
    [modelName],
  );

  allItems.push(...firstPage.data);

  const totalPages = firstPage.meta.pagination.pageCount;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2,
    );

    const responses = await Promise.all(
      remainingPages.map((page) =>
        fetchFromAPI<PaginatedResponse<T>>(
          additionalConfig(
            new StrapiUrlBuilder(modelName)
              .addFields(fields)
              .addPagination(page, batchSize),
          ).toString(),
          [modelName],
        ),
      ),
    );

    responses.forEach((response) => allItems.push(...response.data));
  }

  return allItems;
}

export async function fetchSingleItem<T>(
  modelName: string,
  slug: string,
  fields: readonly string[],
): Promise<T> {
  const urlBuilder = new StrapiUrlBuilder(modelName)
    .addFields(fields)
    .addFilter('slug', slug);

  const response = await fetchFromAPI<{ data: T[] }>(urlBuilder.toString(), [
    modelName,
    `${modelName}-${slug}`,
  ]);

  if (!response.data || response.data.length === 0) {
    throw new Error(`${modelName} with slug "${slug}" not found`);
  }

  return response.data[0];
}
