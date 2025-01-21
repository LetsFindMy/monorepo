import { Suspense } from 'react';
import { Container, Title, Text } from '@mantine/core';
import { GroupedList } from '#/ui/GroupedList';
import { notFound } from 'next/navigation';
import {
  ALLOWED_TAXONOMIES,
  isAllowedTaxonomy,
  RouteName,
} from '#/lib/allowedTaxonomies';
import { getTaxonomyData } from '#/lib/taxonomyUtils';
import { ParamsDebug } from '#/ui/shared';
import { CustomIcon } from '@/src/ui/icons';

export function generateStaticParams() {
  return ALLOWED_TAXONOMIES.map((taxonomy) => ({ taxonomy }));
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ taxonomy: string }>;
}) {
  const { taxonomy } = await params;

  if (!isAllowedTaxonomy(taxonomy)) {
    notFound();
  }

  try {
    const { data: items } = await getTaxonomyData(taxonomy as RouteName);

    const title =
      taxonomy === 'cast'
        ? 'Cast'
        : taxonomy.charAt(0).toUpperCase() + taxonomy.slice(1);

    return (
      <Suspense
        fallback={
          <Container size="sm" py="xl">
            <Title order={1} ta="center" mb="xl">
              {title}
            </Title>
            <Text c="dimmed" ta="center">
              Loading {taxonomy}...
            </Text>
          </Container>
        }
      >
        <Container size="sm" py="xl">
          <Title order={1} ta="center" mb="xl">
            {title}
          </Title>
          <GroupedList items={items} basePath={taxonomy} />
        </Container>

        <ParamsDebug params={{ taxonomy, items }} />
      </Suspense>
    );
  } catch (error) {
    console.error(`Error fetching ${taxonomy}:`, error);
    return (
      <Container size="sm" py="xl">
        <Title order={1} ta="center" mb="xl">
          {taxonomy === 'cast'
            ? 'Cast'
            : taxonomy.charAt(0).toUpperCase() + taxonomy.slice(1)}
        </Title>
        <Text c="dimmed" ta="center">
          Unable to load {taxonomy} at this time. Please try again later.
        </Text>
      </Container>
    );
  }
}
