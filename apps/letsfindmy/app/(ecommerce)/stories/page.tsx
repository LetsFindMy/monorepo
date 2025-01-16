import { Suspense } from 'react';
import { Container, Title, Text } from '@mantine/core';
import { GroupedList } from '#/ui/GroupedList';
import { getStories } from '#/lib/actions/stories';

export default async function StoriesPage() {
  try {
    const { data: stories } = await getStories();

    return (
      <Suspense
        fallback={
          <Container size="sm" py="xl">
            <Title order={1} ta="center" mb="xl">
              Stories
            </Title>
            <Text c="dimmed" ta="center">
              Loading stories...
            </Text>
          </Container>
        }
      >
        <Container size="sm" py="xl">
          <Title order={1} ta="center" mb="xl">
            Stories
          </Title>
          <GroupedList items={stories} basePath="stories" />
        </Container>
      </Suspense>
    );
  } catch (error) {
    console.error(`Error fetching stories:`, error);
    return (
      <Container size="sm" py="xl">
        <Title order={1} ta="center" mb="xl">
          Stories
        </Title>
        <Text c="dimmed" ta="center">
          Unable to load stories at this time. Please try again later.
        </Text>
      </Container>
    );
  }
}
