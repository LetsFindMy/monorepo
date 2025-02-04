import { createMantineTest, expect, describe, it } from '../index';
import { Button } from '@mantine/core';
import React from 'react';
import { vi } from 'vitest';

const test = createMantineTest();

describe('Button', () => {
  it('renders with default props', () => {
    test.render(<Button>Default Button</Button>);
    const button = test.screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Default Button');
    expect(button).toHaveClass('mantine-Button-root');
  });

  it('renders with custom color', () => {
    test.render(<Button color="red">Red Button</Button>);
    const button = test.screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Red Button');
    // Check if the button has a style attribute with the custom color
    expect(button).toHaveAttribute(
      'style',
      expect.stringContaining('--button-bg'),
    );
  });

  it('renders with custom variant', () => {
    test.render(<Button variant="outline">Outline Button</Button>);
    const button = test.screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('mantine-Button-root');
    // For outline variant, we should check for a specific style
    expect(button).toHaveAttribute('data-variant', 'outline');
  });

  it('renders with custom size', () => {
    test.render(<Button size="xl">Large Button</Button>);
    const button = test.screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('mantine-Button-root');
    // For size, we should check for a data attribute
    expect(button).toHaveAttribute('data-size', 'xl');
  });

  it('renders as disabled', () => {
    test.render(<Button disabled>Disabled Button</Button>);
    const button = test.screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    test.render(<Button onClick={onClick}>Click me</Button>);
    await test.user.click(test.screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click event when disabled', async () => {
    const onClick = vi.fn();
    test.render(
      <Button onClick={onClick} disabled>
        Click me
      </Button>,
    );
    await test.user.click(test.screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders with left icon', () => {
    test.render(
      <Button leftSection={<span data-testid="left-icon" />}>
        Button with Left Icon
      </Button>,
    );
    const leftIcon = test.screen.getByTestId('left-icon');
    expect(leftIcon).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    test.render(
      <Button rightSection={<span data-testid="right-icon" />}>
        Button with Right Icon
      </Button>,
    );
    const rightIcon = test.screen.getByTestId('right-icon');
    expect(rightIcon).toBeInTheDocument();
  });

  it('applies custom class name', () => {
    test.render(<Button className="custom-class">Custom Class Button</Button>);
    const button = test.screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    test.render(<Button ref={ref}>Ref Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
