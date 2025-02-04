import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';
import { Box, MantineProvider } from '@mantine/core';
import { IconHeart, IconStar, IconSettings } from '@tabler/icons-react';

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],

  argTypes: {
    icon: {
      control: 'select',
      options: ['heart', 'star', 'settings'],
      mapping: {
        heart: <IconHeart size={18} />,
        star: <IconStar size={18} />,
        settings: <IconSettings size={18} />,
      },
    },
    children: { control: 'text' },
    variant: {
      control: 'select',
      options: ['filled', 'light', 'outline', 'subtle', 'default'],
    },
    color: {
      control: 'select',
      options: ['blue', 'red', 'green', 'yellow', 'pink'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    icon: <IconHeart size={18} />,
    children: 'Like',
    variant: 'filled',
    color: 'blue',
    size: 'md',
  },
};

export const WithDifferentIcon: Story = {
  args: {
    ...Default.args,
    icon: <IconStar size={18} />,
    children: 'Favorite',
  },
};

export const OutlineVariant: Story = {
  args: {
    ...Default.args,
    variant: 'outline',
  },
};

export const LightVariant: Story = {
  args: {
    ...Default.args,
    variant: 'light',
  },
};

export const SubtleVariant: Story = {
  args: {
    ...Default.args,
    variant: 'subtle',
  },
};

export const DifferentSizes: Story = {
  render: (args) => (
    <Box style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
      <IconButton {...args} size="xs">
        XS
      </IconButton>
      <IconButton {...args} size="sm">
        SM
      </IconButton>
      <IconButton {...args} size="md">
        MD
      </IconButton>
      <IconButton {...args} size="lg">
        LG
      </IconButton>
      <IconButton {...args} size="xl">
        XL
      </IconButton>
    </Box>
  ),
  args: {
    ...Default.args,
    icon: <IconSettings size={18} />,
  },
};

export const DifferentColors: Story = {
  render: (args) => (
    <Box style={{ display: 'flex', gap: '1rem' }}>
      <IconButton {...args} color="blue">
        Blue
      </IconButton>
      <IconButton {...args} color="red">
        Red
      </IconButton>
      <IconButton {...args} color="green">
        Green
      </IconButton>
      <IconButton {...args} color="yellow">
        Yellow
      </IconButton>
      <IconButton {...args} color="pink">
        Pink
      </IconButton>
    </Box>
  ),
  args: {
    ...Default.args,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};
