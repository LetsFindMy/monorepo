import {
  Card,
  Text,
  Group,
  Stack,
  Title,
  Container,
  Badge,
} from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import { getStory, getStorySlugs } from '#/lib/actions/stories';
import { getStoryRelease, getStoryReleaseSlugs } from '#/lib/actions/storyReleases';
import dayjs from 'dayjs';

export async function generateStaticParams() {
  const params = [];
  try {
    const storySlugs = await getStorySlugs();

    for (const storySlug of storySlugs) {
      const releaseSlugs = await getStoryReleaseSlugs(storySlug);
      params.push(
        ...releaseSlugs.map((releaseSlug) => ({
          taxonomy: 'stories',
          slug: storySlug,
          releaseSlug,
        })),
      );
    }
  } catch (error) {
    console.error('Error generating release params:', error);
  }
  return params;
}

export default async function StoryReleasePage({
  params,
}: {
    params: Promise<{ taxonomy: string; slug: string,releaseSlug: string }>;
}) {
  const { taxonomy, slug, releaseSlug } = await params;

    if (taxonomy !== 'stories') {notFound()}

    const storyResponse = await getStory(slug);
    const story = storyResponse.data;
    if (!story) {notFound()}

     const releaseResponse = await getStoryRelease(slug, releaseSlug);
    const release = releaseResponse.data;
    if (!release) {notFound()}

    return (
      <Container size="lg" py="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <div>
              <Title order={2} size="h4" c="dimmed" mb={2}>
                {story.name}
              </Title>
              <Title order={1}>{release.name}</Title>
            </div>

            <Group>
              <Badge>{release.type}</Badge>
              {release.releaseDate && (
                <Group>
                  <IconCalendar size={16} />
                  <Text>{dayjs(release.releaseDate).format('MMMM D, YYYY')}</Text>
                </Group>
              )}
            </Group>

            {release.copy?.description && (
              <Text>{release.copy.description}</Text>
            )}

            {release.products && release.products.length > 0 && (
              <Stack gap="xs">
                <Text fw={700}>Related Products:</Text>
                <Group>
                  {release.products.map((product) => (
                    <Badge key={product.id} variant="light">
                      {product.name}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            )}
          </Stack>
        </Card>
      </Container>
    );

}