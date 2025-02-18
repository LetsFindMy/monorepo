import { z } from 'zod';
import {
  FetchResult,
  fetchXmlContent,
  isValidUrl,
  errorResponse,
  successResponse,
} from '../utils';

// Types specific to products endpoint
type UrlValidationResult = Readonly<{
  url: string;
  isValid: boolean;
}>;

type ValidationResult = Readonly<{
  isValid: boolean;
  invalidUrls: ReadonlyArray<{
    url: string;
    message: string;
  }>;
}>;

// Schema specific to products endpoint
const productsSchema = z
  .object({
    data: z.object({
      urls: z.array(z.string().url().trim()).min(1),
    }),
  })
  .strict();

// Validation handlers specific to products endpoint
const validateUrl = async (url: string): Promise<ValidationResult> => {
  const isValid = isValidUrl(url);

  return {
    isValid,
    invalidUrls: isValid
      ? []
      : [
          {
            url,
            message: 'Invalid URL format or protocol',
          },
        ],
  };
};

// Extract URLs specific to products endpoint
const extractUrls = (xmlContent: string): string[] => {
  const matches = xmlContent.match(/<loc>([^<]+)<\/loc>/g) ?? [];
  return matches.map((match) => match.replace(/<\/?loc>/g, '').trim());
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = productsSchema.safeParse(body);

    if (!result.success) {
      return errorResponse('Invalid request body', result.error.errors, 400);
    }

    const url = result.data.data.urls[0]; // We'll process the first URL
    const { isValid, invalidUrls } = await validateUrl(url);

    if (!isValid) {
      return errorResponse('Invalid URL detected', invalidUrls, 400);
    }

    const fetchResult = await fetchXmlContent(url);

    if (fetchResult.error) {
      return errorResponse(
        'Failed to fetch XML content',
        fetchResult.error,
        500,
      );
    }

    const urls = extractUrls(fetchResult.content!);

    return successResponse('Successfully extracted product URLs from sitemap', {
      urls,
      total: urls.length,
    });
  } catch (error) {
    return errorResponse(
      'Error processing request',
      error instanceof Error ? error.message : 'Unknown error',
      500,
    );
  }
}
