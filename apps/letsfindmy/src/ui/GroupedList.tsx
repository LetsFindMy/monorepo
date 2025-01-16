'use client'

import { List, Stack, Badge } from '@mantine/core';
import { Anchor } from '@mantine/core';
import Link from 'next/link';

interface TypeGroupProps<T extends ListItem> {
  type: string;
  items: T[];
  useGroups: boolean;
  typeConfigs?: Record<string, TypeConfig>;
  basePath: string;
}

interface ListItemProps {
  item: ListItem;
  basePath: string;
}

export interface TypeConfig {
  label: string;
}

export interface ListItem {
  id: string | number;
  type?: string;
  name: string;
  slug: string;
}

export interface GroupedListProps<T extends ListItem> {
  items: T[];
  typeConfigs?: Record<string, TypeConfig>;
  basePath: string;
}

export const groupItemsByType = <T extends ListItem>(
  items: T[],
  useGroups: boolean
): Record<string, T[]> => {
  if (!useGroups) {
    return { all: items };
  }

  return items.reduce((acc, item) => {
    const type = item.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

export const sortTypes = (types: string[]): string[] => {
  return types.sort((a, b) => a.localeCompare(b));
};

const ListItemComponent = ({ item, basePath }: ListItemProps) => (
  <List.Item key={item.id}>
    <Anchor
      component={Link}
      href={`/${basePath}/${item.slug}`}
      underline="hover"
      fw={500}
    >
      {item.name}
    </Anchor>
  </List.Item>
);

const TypeGroup = <T extends ListItem>({
  type,
  items,
  useGroups,
  typeConfigs,
  basePath
}: TypeGroupProps<T>) => (
  <div key={type}>
    {useGroups && (
      <Badge size="lg" radius="sm" mb="md">
        {typeConfigs?.[type]?.label || type}
      </Badge>
    )}
    <List
      spacing="sm"
      size="lg"
      listStyleType="none"
    >
      {items.map((item) => (
        <ListItemComponent
          key={item.id}
          item={item}
          basePath={basePath}
        />
      ))}
    </List>
  </div>
);

export const GroupedList = <T extends ListItem>({
  items,
  typeConfigs,
  basePath
}: GroupedListProps<T>) => {
  const useGroups = !!typeConfigs;
  const groupedItems = groupItemsByType(items, useGroups);
  const types = sortTypes(Object.keys(groupedItems));

  return (
    <Stack gap="xl" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {types.map((type) => (
        <TypeGroup
          key={type}
          type={type}
          items={groupedItems[type]}
          useGroups={useGroups}
          typeConfigs={typeConfigs}
          basePath={basePath}
        />
      ))}
    </Stack>
  );
};