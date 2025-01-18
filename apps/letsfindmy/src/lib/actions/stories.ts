'use server';

import { fetchAllPages, fetchSingleItem } from "#/lib/cmsUtils";



// Types
interface Story {
  id: number;
  name: string;
  slug: string;
  studio?: 'disney' | 'pixar' | 'marvel' | 'lucasfilm';
  shortDescription?: string;
  fullDescription?: string;
  cast?: Array<{ id: number; name: string }>;
  releases?: Array<{ id: number; name: string }>;
  fandom?: { id: number; name: string };
  metas?: Array<{ id: number; name: string }>;
  collections?: Array<{ id: number; name: string }>;
  products?: Array<{ id: number; name: string }>;
  crosscheck?: { id: number };
  copy?: {
    title?: string;
    description?: string;
  };
  findReplaceReject?: Array<{ id: number }>;
  createdAt: string;
  updatedAt: string;
}

// Constants
const BATCH_SIZE = 100;

const DEFAULT_FIELDS = {
  single: ['name', 'slug', 'studio', 'shortDescription', 'fullDescription'] as const,
  list: ['name', 'slug', 'studio', 'shortDescription'] as const,
};

// Server Actions
export async function getStories() {
  const stories = await fetchAllPages<Story>('stories', DEFAULT_FIELDS.list, BATCH_SIZE);
  return {
    data: stories,
    meta: { total: stories.length },
  };
}

export async function getStory(slug: string) {
    const story = await fetchSingleItem<Story>('stories', slug, DEFAULT_FIELDS.single);
    return {
      data: story,
      meta: {},
    };
}

export async function getStorySlugs() {
  const stories = await fetchAllPages<Story>('stories', ['slug'] as const, BATCH_SIZE);
  return stories.map((story: { slug: string; }) => story.slug);
}

