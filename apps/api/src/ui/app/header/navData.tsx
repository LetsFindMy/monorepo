import { ModelKey, taxonomyMapping } from '#/lib/allowedTaxonomies';
import { Anchor } from '@mantine/core';
import {
  IconBabyCarriage,
  IconCategory,
  IconHome,
  IconShirt,
  IconShoppingCart,
  IconTower,
  IconBook,
  IconNotification,
  IconBrush,
  IconCalendarEvent,
  IconMapPin,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';

// Define the structure for menu items
export interface MenuItem {
  label?: string;
  href: string;
  icon?: React.ReactNode;
  subItems?: MenuItem[];
}

// Icon mapping for each taxonomy category
const CATEGORY_ICONS: Record<ModelKey, React.ReactNode> = {
  BRAND: <IconBrush size={20} />,
  CAST: <IconUsers size={20} />,
  COLLECTION: <IconShoppingCart size={20} />,
  EVENT: <IconCalendarEvent size={20} />,
  FANDOM: <IconNotification size={20} />,
  LOCATION: <IconMapPin size={20} />,
  META: <IconTag size={20} />,
  PRODUCT_CATEGORY: <IconShirt size={20} />,
  STORY: <IconBook size={20} />,
};

// Generate mockdata from taxonomy mapping
const generateMockData = () => {
  return Object.entries(taxonomyMapping).map(([modelKey, routes]) => {
    const subKeys = Object.keys(routes);
    const formattedTitle = modelKey
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      icon: CATEGORY_ICONS[modelKey as ModelKey],
      title: formattedTitle,
      description: (
        <>
          {subKeys.map((routeName, index) => (
            <span key={routeName}>
              <Anchor component={Link} href={`/${routeName}`} size="sm">
                {routeName
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Anchor>
              {index < subKeys.length - 1 && ', '}
            </span>
          ))}
        </>
      ),
    };
  });
};

const mockdata = generateMockData();

export const menuItems: MenuItem[] = [
  {
    href: '#',
    icon: <IconCategory size={20} />,
    subItems: mockdata,
  },
  {
    label: 'Clothing',
    href: '/clothing',
    subItems: [
      { label: 'Men', href: '/clothing/men', icon: <IconShirt size={16} /> },
      {
        label: 'Women',
        href: '/clothing/women',
        icon: <IconShirt size={16} />,
      },
      { label: 'Kids', href: '/clothing/kids', icon: <IconShirt size={16} /> },
    ],
  },
  {
    label: 'Home',
    href: '/home',
    subItems: [
      {
        label: 'Living Room',
        href: '/home/living-room',
        icon: <IconHome size={16} />,
      },
      { label: 'Bedroom', href: '/home/bedroom', icon: <IconHome size={16} /> },
      { label: 'Kitchen', href: '/home/kitchen', icon: <IconHome size={16} /> },
    ],
  },
  {
    label: 'Toys & Games',
    href: '/toy-games',
    subItems: [
      {
        label: 'Board Games',
        href: '/toy-games/board-games',
        icon: <IconTower size={16} />,
      },
      {
        label: 'Outdoor Toys',
        href: '/toy-games/outdoor-toys',
        icon: <IconTower size={16} />,
      },
      {
        label: 'Educational Toys',
        href: '/toy-games/educational-toys',
        icon: <IconTower size={16} />,
      },
    ],
  },
  {
    label: 'Everyday',
    href: '/everyday',
    subItems: [
      {
        label: 'Electronics',
        href: '/everyday/electronics',
        icon: <IconShoppingCart size={16} />,
      },
      {
        label: 'Groceries',
        href: '/everyday/groceries',
        icon: <IconShoppingCart size={16} />,
      },
      {
        label: 'Personal Care',
        href: '/everyday/personal-care',
        icon: <IconShoppingCart size={16} />,
      },
    ],
  },
  {
    label: 'Kids',
    href: '/kids',
    subItems: [
      {
        label: 'Clothing',
        href: '/kids/clothing',
        icon: <IconBabyCarriage size={16} />,
      },
      {
        label: 'Toys',
        href: '/kids/toys',
        icon: <IconBabyCarriage size={16} />,
      },
      {
        label: 'School Supplies',
        href: '/kids/school-supplies',
        icon: <IconBabyCarriage size={16} />,
      },
    ],
  },
  {
    label: 'Baby',
    href: '/baby',
    subItems: [
      {
        label: 'Diapers',
        href: '/baby/diapers',
        icon: <IconBabyCarriage size={16} />,
      },
      {
        label: 'Feeding',
        href: '/baby/feeding',
        icon: <IconBabyCarriage size={16} />,
      },
      {
        label: 'Nursery',
        href: '/baby/nursery',
        icon: <IconBabyCarriage size={16} />,
      },
    ],
  },
];
