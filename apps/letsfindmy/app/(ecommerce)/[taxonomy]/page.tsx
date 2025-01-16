import { Suspense } from 'react';
import { Container, Title, Text } from '@mantine/core';
import { GroupedList } from '#/ui/GroupedList';
import { notFound } from 'next/navigation';
import { ALLOWED_TAXONOMIES, isAllowedType, taxonomyToCollection, ModelKey } from '#/lib/allowedTaxonomies';
import { getMetas } from '@/src/lib/actions/metas';

export function generateStaticParams() {
  return ALLOWED_TAXONOMIES.map(taxonomy => ({ taxonomy }));
}

export default async function DynamicPage({ params }: { params: Promise<{ taxonomy: string }> }) {
  const { taxonomy } = await params;

  if (!isAllowedType(taxonomy)) {
    notFound();
  }

  try {
    const collection: ModelKey = taxonomyToCollection(taxonomy);
    let items;
    switch (collection) {
      case 'META':
        items = await getMetas(taxonomy as any);
        break;
      case 'LOCATION':
        // Handle LOCATION case
        break;
      default:
        throw new Error(`Unhandled collection type: ${collection}`);
    }

    const title = taxonomy.charAt(0).toUpperCase() + taxonomy.slice(1);

    console.log('items,', items)

    return (
      <Suspense fallback={
        <Container size="sm" py="xl">
          <Title order={1} ta="center" mb="xl">{title}</Title>
          <Text c="dimmed" ta="center">Loading {taxonomy}s...</Text>
        </Container>
      }>
        <Container size="sm" py="xl">
          <Title order={1} ta="center" mb="xl">{title}</Title>
          <GroupedList items={items.data} basePath={taxonomy} />
        </Container>
      </Suspense>
    );
  } catch (error) {
    console.error(`Error fetching ${taxonomy}s:`, error);
    return (
      <Container size="sm" py="xl">
        <Title order={1} ta="center" mb="xl">{taxonomy.charAt(0).toUpperCase() + taxonomy.slice(1)}s</Title>
        <Text c="dimmed" ta="center">Unable to load {taxonomy}s at this time. Please try again later.</Text>
      </Container>
    );
  }
}

