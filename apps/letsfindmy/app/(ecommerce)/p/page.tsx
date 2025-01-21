import {
  Card,
  Text,
  Group,
  Stack,
  Title,
  Container,
  SimpleGrid,
  Anchor,
  Badge,
} from '@mantine/core';
import { getProducts } from '#/lib/actions/products';
import Link from 'next/link';
import { IconTag } from '@tabler/icons-react';

export const revalidate = 3600; // Revalidate every hour

export default async function ProductsPage() {
  try {
    const { data: products } = await getProducts();

    return (
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Title order={1}>All Products</Title>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {products.map((product) => (
              <Card
                key={product.slug}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                component={Link}
                href={`/p/${product.slug}`}
              >
                <Stack gap="sm">
                  <Title order={3}>{product.name}</Title>

                  {product.copy?.description && (
                    <Text lineClamp={3}>{product.copy.description}</Text>
                  )}

                  <Group>
                    {product.category && (
                      <Badge
                        leftSection={<IconTag size={14} />}
                        variant="light"
                        color="blue"
                      >
                        {product.category.name}
                      </Badge>
                    )}
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    );
  } catch (error) {
    console.error('Error loading products:', error);
    return (
      <Container size="lg" py="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={1}>Products Unavailable</Title>
            <Text>
              Unable to load product listings at this time. Please try again
              later.
            </Text>
          </Stack>
        </Card>
      </Container>
    );
  }
}
