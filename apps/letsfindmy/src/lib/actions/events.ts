'use server';

import { fetchFromAPI, StrapiUrlBuilder } from '#/lib/cmsUtils';

// Types
type EventType = 'event' | 'entertainment' | 'holiday' | 'festival' | 'other';

interface Event {
  id: number;
  name: string;
  slug: string;
  type: EventType;
  copy?: {
    title?: string;
    description?: string;
  };
  locations: Array<{ id: number; name: string }>;
  collections?: Array<{ id: number; name: string }>;
  products?: Array<{ id: number; name: string }>;
  crosscheck?: { id: number };
  findReplaceReject?: Array<{ id: number }>;
  createdAt: string;
  updatedAt: string;
  locale: string;
}

// Constants
const BATCH_SIZE = 100;

// API Configuration
const RELATIONS = {
  fields: ['name', 'slug', 'type'],
  populate: '*',
} as const;

const DEFAULT_FIELDS = {
  single: ['name', 'slug', 'type'],
  list: ['name', 'slug', 'type'],
} as const;

// Server Actions
export async function getEvents() {
  const allEvents: Event[] = [];

  const firstPage = await fetchFromAPI<{
    data: Event[];
    meta: { pagination: { pageCount: number; total: number } };
  }>(
    new StrapiUrlBuilder('events')
      .addPopulate(RELATIONS.populate)
      .addFields(DEFAULT_FIELDS.list)
      .addPagination(1, BATCH_SIZE)
      .toString(),
    ['events'],
  );

  allEvents.push(...firstPage.data);

  const totalPages = firstPage.meta.pagination.pageCount;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2,
    );

    const responses = await Promise.all(
      remainingPages.map((page) =>
        fetchFromAPI<{ data: Event[] }>(
          new StrapiUrlBuilder('events')
            .addPopulate(RELATIONS.populate)
            .addFields(DEFAULT_FIELDS.list)
            .addPagination(page, BATCH_SIZE)
            .toString(),
          ['events'],
        ),
      ),
    );

    responses.forEach((response) => allEvents.push(...response.data));
  }

  return {
    data: allEvents,
    meta: { total: firstPage.meta.pagination.total },
  };
}

export async function getEvent(slug: string, fields?: string[]) {
  const response = await fetchFromAPI<{ data: Event[] }>(
    new StrapiUrlBuilder('events', slug)
      .addPopulate(RELATIONS.populate)
      .addFields(fields ?? DEFAULT_FIELDS.single)
      .toString(),
    ['events', `event-${slug}`],
  );

  if (!response.data.length) {
    throw new Error(`Event with slug "${slug}" not found`);
  }

  return {
    data: response.data[0],
    meta: {},
  };
}

export async function getEventSlugs() {
  const response = await getEvents();
  return response.data.map((event) => event.slug);
}
