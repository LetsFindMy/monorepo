'use client';

import { Anchor, Badge, SimpleGrid, Stack } from '@mantine/core';
import Link from 'next/link';
import { memo, useMemo } from 'react';

type Item = {
  readonly id: string | number;
  readonly type?: string;
  readonly name: string;
  readonly slug: string;
};

type GroupStrategy = 'type' | 'alpha';

type Props<T extends Item> = {
  readonly items: readonly T[];
  readonly typeConfigs?: Readonly<Record<string, { label: string }>>;
  readonly basePath: string;
  readonly groupBy?: GroupStrategy;
};

const useGroupedItems = <T extends Item>(
  items: readonly T[],
  strategy: GroupStrategy,
) => {
  return useMemo(() => {
    const groups = items.reduce(
      (acc, item) => {
        const key =
          strategy === 'alpha'
            ? (item.name[0]?.toUpperCase() ?? 'Other')
            : (item.type ?? 'Other');

        return { ...acc, [key]: [...(acc[key] ?? []), item] };
      },
      {} as Record<string, T[]>,
    );

    if (strategy === 'alpha') {
      Object.keys(groups).forEach((key) => {
        groups[key].sort((a, b) => a.name.localeCompare(b.name));
      });
    }

    return groups;
  }, [items, strategy]);
};

const GroupSection = memo(
  <T extends Item>({
    type,
    items,
    typeConfigs,
    basePath,
  }: {
    type: string;
    items: T[];
    typeConfigs?: Props<T>['typeConfigs'];
    basePath: string;
  }) => (
    <section data-group={type}>
      <Badge size="lg" radius="sm" mb="md">
        {typeConfigs?.[type]?.label ?? type}
      </Badge>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        {items.map((item) => (
          <Anchor
            key={item.id}
            component={Link}
            href={`/${basePath}/${item.slug}`}
            underline="hover"
            fw={500}
            prefetch={false}
          >
            {item.name}
          </Anchor>
        ))}
      </SimpleGrid>
    </section>
  ),
);

GroupSection.displayName = 'GroupSection';

export const GroupedList = <T extends Item>({
  items,
  typeConfigs,
  basePath,
  groupBy = 'type',
}: Props<T>) => {
  const strategy = typeConfigs ? 'type' : groupBy;
  const groupedItems = useGroupedItems(items, strategy);
  const sortedGroups = useMemo(
    () => Object.keys(groupedItems).sort(),
    [groupedItems],
  );

  return (
    <Stack gap="xl" maw={600} mx="auto">
      {sortedGroups.map((type) => (
        <GroupSection
          key={type}
          type={type}
          items={groupedItems[type]}
          typeConfigs={typeConfigs}
          basePath={basePath}
        />
      ))}
    </Stack>
  );
};
