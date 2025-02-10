/**
 * Extracts the ASIN from a given Amazon URL or plain ASIN string.
 *
 * @param input - A URL or plain ASIN string.
 * @returns The extracted ASIN if found; otherwise, undefined.
 */
export const parseAsin = (input: string): string | undefined => {
  const trimmed = input.trim();

  // If the input is a valid ASIN (10 alphanumeric characters), return it.
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    return match?.[1];
  } catch {
    // If the input isn't a valid URL, try matching it directly.
    const match = trimmed.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    return match?.[1];
  }
};
