import {
  Group,
  Text,
  Divider,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  rem,
  AppShell,
  Container,
  Anchor,
  HoverCard,
  Button,
  Center,
  SimpleGrid,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
  Collapse,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBabyCarriage, IconCategory, IconHome, IconShirt, IconShoppingCart, IconTower, IconBook, IconChartPie3, IconChevronDown, IconCode, IconCoin, IconFingerprint, IconNotification } from '@tabler/icons-react';
import classes from './AppHeader.module.scss';
import { AppHeaderUserMenu } from './AppHeaderUserMenu';
import { AnimatedAnchorMemo } from '../Logo';
import Link from 'next/link';

// Define the structure for menu items
interface MenuItem {
  label?: string;
  href: string;
  icon?: React.ReactNode;
  subItems?: MenuItem[];
}


const mockdata = [
  {
    icon: IconCode,
    title: 'Open source',
    description: 'This Pokémon\'s cry is very loud and distracting',
  },
  {
    icon: IconCoin,
    title: 'Free for everyone',
    description: 'The fluid of Smeargle\'s tail secretions changes',
  },
  {
    icon: IconBook,
    title: 'Documentation',
    description: 'Yanma is capable of seeing 360 degrees without',
  },
  {
    icon: IconFingerprint,
    title: 'Security',
    description: 'The shell\'s rounded shape and the grooves on its.',
  },
  {
    icon: IconChartPie3,
    title: 'Analytics',
    description: 'This Pokémon uses its flying ability to quickly chase',
  },
  {
    icon: IconNotification,
    title: 'Notifications',
    description: 'Combusken battles with the intensely hot flames it spews',
  },
];


// Array of menu items
const menuItems: MenuItem[] = [
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
      { label: 'Women', href: '/clothing/women', icon: <IconShirt size={16} /> },
      { label: 'Kids', href: '/clothing/kids', icon: <IconShirt size={16} /> },
    ]
  },
  {
    label: 'Home',
    href: '/home',
    subItems: [
      { label: 'Living Room', href: '/home/living-room', icon: <IconHome size={16} /> },
      { label: 'Bedroom', href: '/home/bedroom', icon: <IconHome size={16} /> },
      { label: 'Kitchen', href: '/home/kitchen', icon: <IconHome size={16} /> },
    ]
  },
  {
    label: 'Toys & Games',
    href: '/toy-games',
    subItems: [
      { label: 'Board Games', href: '/toy-games/board-games', icon: <IconTower size={16} /> },
      { label: 'Outdoor Toys', href: '/toy-games/outdoor-toys', icon: <IconTower size={16} /> },
      { label: 'Educational Toys', href: '/toy-games/educational-toys', icon: <IconTower size={16} /> },
    ]
  },
  {
    label: 'Everyday',
    href: '/everyday',
    subItems: [
      { label: 'Electronics', href: '/everyday/electronics', icon: <IconShoppingCart size={16} /> },
      { label: 'Groceries', href: '/everyday/groceries', icon: <IconShoppingCart size={16} /> },
      { label: 'Personal Care', href: '/everyday/personal-care', icon: <IconShoppingCart size={16} /> },
    ]
  },
  {
    label: 'Kids',
    href: '/kids',
    subItems: [
      { label: 'Clothing', href: '/kids/clothing', icon: <IconBabyCarriage size={16} /> },
      { label: 'Toys', href: '/kids/toys', icon: <IconBabyCarriage size={16} /> },
      { label: 'School Supplies', href: '/kids/school-supplies', icon: <IconBabyCarriage size={16} /> },
    ]
  },
  {
    label: 'Baby',
    href: '/baby',
    subItems: [
      { label: 'Diapers', href: '/baby/diapers', icon: <IconBabyCarriage size={16} /> },
      { label: 'Feeding', href: '/baby/feeding', icon: <IconBabyCarriage size={16} /> },
      { label: 'Nursery', href: '/baby/nursery', icon: <IconBabyCarriage size={16} /> },
    ]
  },
];


export const AppLayoutHeader = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);

  const renderDesktopMenuItem = (item: MenuItem) => {
    const theme = useMantineTheme();

    if (item.icon && item.icon.type === IconCategory) {
      const links = mockdata.map((item) => (
        <UnstyledButton className={classes.subLink} key={item.title}>
          <Group wrap="nowrap" align="flex-start">
            <ThemeIcon size={34} variant="default" radius="md">
              <item.icon size={22} color={theme.colors.blue[6]} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500}>
                {item.title}
              </Text>
              <Text size="xs" c="dimmed">
                {item.description}
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      ));

      return (
        <HoverCard
          key={item.href}
          position="bottom"
          radius="md"
          shadow="md"
          withinPortal
        >
          <HoverCard.Target>
            <Button
              variant="subtle"
              className={classes.hoverCardTarget}
            >
              <Center inline>
                <Box component="span" mr={5}>
                  <IconCategory size={20} />
                </Box>
                <IconChevronDown size={16} color={theme.colors.blue[6]} />
              </Center>
            </Button>
          </HoverCard.Target>

          <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
            <Group justify="space-between" px="md">
              <Text fw={500}>Categories</Text>
              <Anchor href="#" fz="xs">
                View all
              </Anchor>
            </Group>

            <Divider my="sm" />

            <SimpleGrid cols={2} spacing={0}>
              {links}
            </SimpleGrid>

            <div className={classes.dropdownFooter}>
              <Group justify="space-between">
                <div>
                  <Text fw={500} fz="sm">
                    Get started
                  </Text>
                  <Text size="xs" c="dimmed">
                    Explore our categories and find what you need
                  </Text>
                </div>
                <Button variant="default">Get started</Button>
              </Group>
            </div>
          </HoverCard.Dropdown>
        </HoverCard>
      );
    }

    return (
      <HoverCard
        key={item.label || item.href}
        position="bottom"
        radius="sm"
        withArrow
        shadow="md"
        arrowSize={14}
      >
        <HoverCard.Target>
          <Button
            variant="subtle"
            className={classes.hoverCardTarget}
          >
            {item.label ? item.label : item.icon}
          </Button>
        </HoverCard.Target>
        <HoverCard.Dropdown p="0">
          <div className={classes.dropdownContent}>
            {item.subItems && item.subItems.map((subItem) => (
              <Anchor
                key={subItem.label}
                component={Link}
                href={subItem.href}
                className={classes.dropdownLink}
              >
                {subItem.icon && <span className={classes.dropdownIcon}>{subItem.icon}</span>}
                {subItem.label}
              </Anchor>
            ))}
            {!item.subItems && (
              <Text size="sm">No additional options available.</Text>
            )}
          </div>
        </HoverCard.Dropdown>
      </HoverCard>
    );
  };

  const renderMobileMenuItem = (item: MenuItem, depth = 0) => {
    const theme = useMantineTheme();
    if (item.icon && item.icon.type === IconCategory) {
      return (
        <Box key={item.href} className={classes.mobileMenuItem} style={{ paddingLeft: `${depth * 16}px` }}>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Categories
              </Box>
              <IconChevronDown size={16} color={theme.colors.blue[6]} />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>
            {mockdata.map((subItem) => (
              <UnstyledButton className={classes.subLink} key={subItem.title}>
                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon size={34} variant="default" radius="md">
                    <subItem.icon size={22} color={theme.colors.blue[6]} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={500}>
                      {subItem.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {subItem.description}
                    </Text>
                  </div>
                </Group>
              </UnstyledButton>
            ))}
          </Collapse>
        </Box>
      );
    }

    return (
      <Box key={item.label || item.href} className={classes.mobileMenuItem} style={{ paddingLeft: `${depth * 16}px` }}>
        <Group spacing="xs" className={classes.mobileMenuItemLabel}>
          {item.icon}
          {item.label && <Text>{item.label}</Text>}
        </Group>
        {item.subItems && (
          <Box className={classes.mobileSubMenu}>
            {item.subItems.map((subItem) => (
              <Anchor
                key={subItem.label}
                component={Link}
                href={subItem.href}
                className={classes.mobileLink}
                onClick={closeDrawer}
              >
                <Group spacing="xs">
                  {subItem.icon}
                  <Text>{subItem.label}</Text>
                </Group>
              </Anchor>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <AppShell.Header className={classes.header}>
        <Container size="lg" h="100%" px={{ base: '0', sm: rem(15) }}>
          <Group gap="sm" h="100%">
            <AnimatedAnchorMemo href="/" text="LetsFindMy" />
            <Divider size="xs" orientation="vertical" ml="sm" />

            <Center style={{ flexGrow: 1 }} visibleFrom="sm" >
           <Group gap="xs">   {menuItems.map(renderDesktopMenuItem)}</Group>
            </Center>

            {/* <Box style={{ flexGrow: 1 }} visibleFrom="sm" /> */}
            <Divider size="xs" orientation="vertical" />
            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              hiddenFrom="sm"
            />
            <Box visibleFrom="sm">
              <AppHeaderUserMenu />
            </Box>
          </Group>
        </Container>
      </AppShell.Header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Box p="md">
            <AppHeaderUserMenu />
            <Divider my="sm" />
            {menuItems.map((item) => renderMobileMenuItem(item))}
          </Box>
        </ScrollArea>
      </Drawer>
    </Box>
  );
};

