import {
  Card,
  Image,
  Text,
  Group,
  Stack,
  Title,
  Container,
} from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import {
  ALLOWED_TAXONOMIES,
  isAllowedTaxonomy,
  RouteName,
} from '#/lib/allowedTaxonomies';
import { getTaxonomyData } from '#/lib/taxonomyUtils';

export async function generateStaticParams() {
  const params = [];
  for (const taxonomy of ALLOWED_TAXONOMIES) {
    if (isAllowedTaxonomy(taxonomy)) {
      try {
        const { data: items } = await getTaxonomyData(taxonomy as RouteName);
        const slugs = items.map((item: any) => item.slug);
        params.push(...slugs.map((slug: string) => ({ taxonomy, slug })));
      } catch (error) {
        console.error(`Error generating params for ${taxonomy}:`, error);
      }
    }
  }
  return params;
}

export default async function TaxonomyItemPage({
  params,
}: {
  params: Promise<{ taxonomy: string; slug: string }>;
}) {
  const { taxonomy, slug } = await params;

  if (!isAllowedTaxonomy(taxonomy)) {
    notFound();
  }

  try {
    const { data: item } = await getTaxonomyData(taxonomy as RouteName, slug);

    if (!item) {
      notFound();
    }

    return (
      <Container size="lg" py="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={1}>{item.name}</Title>
            {item.copy?.description && <Text>{item.copy.description}</Text>}
            {item.locations && item.locations.length > 0 && (
              <Group>
                <IconMapPin size={16} />
                <Text>{item.locations.map((loc) => loc.name).join(', ')}</Text>
              </Group>
            )}
          </Stack>
        </Card>
      </Container>
    );
  } catch (error) {
    console.error(`Error fetching ${taxonomy} item:`, error);
    return (
      <Container size="lg" py="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={1}>Item Not Found</Title>
            <Text>
              Unable to load {taxonomy} details at this time. Please try again
              later.
            </Text>
          </Stack>
        </Card>
      </Container>
    );
  }
}
