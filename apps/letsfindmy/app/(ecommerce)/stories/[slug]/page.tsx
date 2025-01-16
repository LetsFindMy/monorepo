import {
  Card,
  Text,
  Group,
  Stack,
  Title,
  Container,
  Badge,
  List,
} from '@mantine/core';
import {
  IconMovie,
  IconBrandProducthunt,
  IconUsers,
} from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import { getStory, getStorySlugs } from '#/lib/actions/stories';

export async function generateStaticParams() {
  const slugs = await getStorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const { data: story } = await getStory(slug);

    if (!story) {
      notFound();
    }

    return (
      <Container size="lg" py="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={1}>{story.name}</Title>
            {story.studio && <Badge>{story.studio}</Badge>}
            {story.shortDescription && <Text>{story.shortDescription}</Text>}
            {story.fullDescription && <Text>{story.fullDescription}</Text>}
            {story.cast && story.cast.length > 0 && (
              <Stack>
                <Group>
                  <IconUsers size={16} />
                  <Text fw={700}>Cast:</Text>
                </Group>
                <List>
                  {story.cast.map((castMember: any) => (
                    <List.Item key={castMember.id}>{castMember.name}</List.Item>
                  ))}
                </List>
              </Stack>
            )}
            {story.collections && story.collections.length > 0 && (
              <Group>
                <IconBrandProducthunt size={16} />
                <Text>Collections: {story.collections.length}</Text>
              </Group>
            )}
            {story.products && story.products.length > 0 && (
              <Group>
                <IconBrandProducthunt size={16} />
                <Text>Products: {story.products.length}</Text>
              </Group>
            )}
            {story.copy?.description && <Text>{story.copy.description}</Text>}
          </Stack>
        </Card>
      </Container>
    );
  } catch (error) {
    console.error(`Error fetching story:`, error);
    return (
      <Container size="lg" py="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={1}>Story Not Found</Title>
            <Text>
              Unable to load story details at this time. Please try again later.
            </Text>
          </Stack>
        </Card>
      </Container>
    );
  }
}
