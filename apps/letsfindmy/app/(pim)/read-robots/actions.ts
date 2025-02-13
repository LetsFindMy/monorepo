'use server';

export async function fetchRobotsTxt(formData: FormData) {
  const url = formData.get('url') as string;

  try {
    // Ensure the URL is properly formatted
    const baseUrl = url.startsWith('http') ? url : `https://${url}`;
    const robotsUrl = new URL('/robots.txt', baseUrl).toString();

    const response = await fetch(robotsUrl, { next: { revalidate: 0 } });

    if (!response.ok) {
      throw new Error(`Failed to fetch robots.txt: ${response.status}`);
    }

    const content = await response.text();

    // Filter out lines starting with "User-agent:", "Disallow:", or "Allow:"
    const filteredContent = content
      .split('\n')
      .filter((line) => {
        const trimmedLine = line.trim().toLowerCase();
        return (
          !trimmedLine.startsWith('user-agent:') &&
          !trimmedLine.startsWith('disallow:') &&
          !trimmedLine.startsWith('allow:')
        );
      })
      .join('\n');

    return filteredContent.trim() || 'No content after filtering.';
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Failed to fetch robots.txt'}`;
  }
}
