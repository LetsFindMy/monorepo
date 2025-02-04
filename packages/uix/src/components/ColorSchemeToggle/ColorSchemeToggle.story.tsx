// ColorSchemeToggle.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeToggle } from './ColorSchemeToggle';
import { MantineProvider } from '@mantine/core';

const meta: Meta<typeof ColorSchemeToggle> = {
  title: 'Components/ColorSchemeToggle',
  component: ColorSchemeToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      values: [
        { name: 'light', value: '#fff' },
        { name: 'dark', value: '#1a1b1e' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ColorSchemeToggle>;

export const Default: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
};

export const LightTheme: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
  decorators: [
    (Story) => (
      <MantineProvider forceColorScheme="light">
        <Story />
      </MantineProvider>
    ),
  ],
};

export const DarkTheme: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <MantineProvider forceColorScheme="dark">
        <Story />
      </MantineProvider>
    ),
  ],
};

export const AutoTheme: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
  decorators: [
    (Story) => (
      <MantineProvider>
        <Story />
      </MantineProvider>
    ),
  ],
};
