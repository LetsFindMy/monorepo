// apps/letsfindmy/app/(ecommerce)/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import {
  Card,
  Text,
  Group,
  Stack,
  Title,
  Container,
  Badge,
  Table,
  Code,
  Anchor,
} from '@mantine/core';
import { getProduct, getProductSlugs } from '#/lib/actions/products';
import { ParamsDebug } from '#/ui/shared';
import Link from 'next/link';

export async function generateStaticParams() {
  try {
    const products = await getProductSlugs();
    // Validate slugs are strings
    return products
      .filter((p) => typeof p.slug === 'string')
      .map(({ slug }) => ({ slug }));
  } catch (error) {
    console.error('Error generating product params:', error);
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: product } = await getProduct(slug);

  if (!product) notFound();

  // Calculate price range
  const prices = product.product_variants?.map((v) => v.price) || [];
  const priceRange =
    prices.length > 0
      ? `$${Math.min(...prices)} - $${Math.max(...prices)}`
      : 'No pricing available';

  return (
    <Container size="lg" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Title order={1}>{product.name}</Title>

          {product.copy?.description && (
            <Text size="lg">{product.copy.description}</Text>
          )}

          <Group>
            <Badge variant="filled" color="blue">
              {priceRange}
            </Badge>
            {product.category && (
              <Badge variant="light">{product.category.name}</Badge>
            )}
          </Group>

          {product.brands && product.brands.length > 0 && (
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Brands:
              </Text>
              <Group>
                {product.brands.map((brand) => (
                  <Anchor component={Link} href={`/brands/${brand.slug}`}>
                    <Badge key={brand.id} variant="outline">
                      {brand.name}
                    </Badge>
                  </Anchor>
                ))}
              </Group>
            </Stack>
          )}

          {product.product_variants?.map((variant) => (
            <tr key={variant.id}>
              <td>#{variant.id}</td>
              <td>${variant.price.toFixed(2)}</td>
              <td>{variant.stock > 0 ? variant.stock : 'Out of stock'}</td>
            </tr>
          ))}
        </Stack>
      </Card>

      <ParamsDebug {...product} />
    </Container>
  );
}
