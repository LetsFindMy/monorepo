import type { Meta, StoryObj } from '@storybook/react';
import { PageFrame } from './PageFrame';
import { Button } from '@mantine/core';

const meta: Meta<typeof PageFrame> = {
  title: 'Components/PageFrame',
  component: PageFrame,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    animate: { control: 'boolean' },
    children: { control: 'text' },
    sideContent: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof PageFrame>;

export const Default: Story = {
  args: {
    title: 'Welcome to PageFrame',
    description: 'This is a versatile page layout component',
    children: <div>Main content goes here</div>,
  },
};

export const WithSideContent: Story = {
  args: {
    ...Default.args,
    sideContent: <Button>Action</Button>,
  },
};

export const Animated: Story = {
  args: {
    ...WithSideContent.args,
    animate: true,
  },
};

export const NoTitleOrDescription: Story = {
  args: {
    children: <div>Only main content, no title or description</div>,
  },
};

export const LongContent: Story = {
  args: {
    title: 'Long Content Example',
    description:
      'This example demonstrates how the PageFrame handles long content',
    children: (
      <div>
        {Array(10)
          .fill(null)
          .map((_, index) => (
            <p key={index}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          ))}
      </div>
    ),
  },
};

export const CustomStyling: Story = {
  args: {
    title: 'Custom Styled PageFrame',
    description: 'This example shows custom styling applied to the PageFrame',
    children: <div>Custom styled content</div>,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div
        style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}
      >
        <Story />
      </div>
    ),
  ],
};
