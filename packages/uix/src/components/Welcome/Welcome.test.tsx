import { createMantineTest, expect, describe, it } from '@repo/testing';
import { Welcome } from '../Welcome';

const test = createMantineTest();

describe('Welcome', () => {
  it('renders the welcome message', () => {
    test.render(<Welcome />);

    // Check for the main title
    const title = test.screen.getByText(/Welcome to/i);
    expect(title).toBeInTheDocument();

    // Check for the Mantine text with gradient
    const mantineText = test.screen.getByText('Mantine');
    expect(mantineText).toBeInTheDocument();
    expect(mantineText).toHaveClass('mantine-Text-root');
    expect(mantineText.parentElement).toHaveStyle({
      backgroundImage: expect.stringContaining('linear-gradient'),
    });

    // Check for the description text
    const description = test.screen.getByText(
      /This starter Next.js project includes/i,
    );
    expect(description).toBeInTheDocument();

    // Check for the anchor link
    const link = test.screen.getByRole('link', { name: /this guide/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://mantine.dev/guides/next/');
  });

  it('applies correct styles', () => {
    test.render(<Welcome />);

    const title = test.screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('mantine-Title-root');
    expect(title).toHaveStyle({
      textAlign: 'center',
      marginTop: '100px',
    });

    const description = test.screen.getByText(
      /This starter Next.js project includes/i,
    );
    expect(description).toHaveClass('mantine-Text-root');
    expect(description).toHaveStyle({
      textAlign: 'center',
      maxWidth: '580px',
      margin: '0 auto',
      marginTop: expect.stringMatching(/\d+px/),
    });
  });
});
