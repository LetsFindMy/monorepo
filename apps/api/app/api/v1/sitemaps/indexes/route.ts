import { z } from 'zod';
import {
  FetchResult,
  fetchXmlContent,
  isValidUrl,
  errorResponse,
  successResponse,
} from '../utils';

// Types specific to posts endpoint
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

// Schema specific to posts endpoint
const postsSchema = z
  .object({
    data: z.array(z.string().url().trim()).min(1).max(100),
  })
  .strict();

// Validation handlers specific to posts endpoint
const validateUrls = async (
  urls: ReadonlyArray<string>,
): Promise<ValidationResult> => {
  const results = await Promise.all(
    urls.map(
      async (url): Promise<UrlValidationResult> => ({
        url,
        isValid: isValidUrl(url),
      }),
    ),
  );

  const invalidUrls = results
    .filter(({ isValid }) => !isValid)
    .map(({ url }) => ({
      url,
      message: 'Invalid URL format or protocol',
    }));

  return {
    isValid: invalidUrls.length === 0,
    invalidUrls,
  };
};

// Process XML contents specific to posts endpoint
const processXmlContents = (results: ReadonlyArray<FetchResult>): string[] => {
  const validContents = results
    .filter(
      (result): result is FetchResult & { content: string } =>
        result.content !== undefined,
    )
    .map(({ content }) => content);

  const allUrls = validContents.flatMap((content) => {
    const matches = content.match(/<loc>([^<]+)<\/loc>/g) ?? [];
    return matches
      .map((match) => match.replace(/<\/?loc>/g, '').trim())
      .filter((url) => /product/i.test(url));
  });

  return [...new Set(allUrls)]; // Remove duplicates
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = postsSchema.safeParse(body);

    if (!result.success) {
      return errorResponse('Invalid request body', result.error.errors, 400);
    }

    const { isValid, invalidUrls } = await validateUrls(result.data.data);

    if (!isValid) {
      return errorResponse('Invalid URLs detected', invalidUrls, 400);
    }

    const fetchResults = await Promise.all(
      result.data.data.map((url) => fetchXmlContent(url)),
    );

    const errors = fetchResults.filter(
      (result): result is typeof result & { error: string } =>
        result.error !== undefined,
    );
    const successful = fetchResults.filter(
      (result): result is typeof result & { content: string } =>
        result.content !== undefined,
    );

    if (successful.length === 0) {
      return errorResponse(
        'Failed to fetch XML content from all URLs',
        errors,
        500,
      );
    }

    const urls = processXmlContents(successful);

    return successResponse(
      errors.length > 0
        ? 'Partially successful: Some URLs could not be fetched'
        : 'Successfully extracted product URLs from XML content',
      {
        urls,
        errors: errors.length > 0 ? errors : undefined,
      },
    );
  } catch (error) {
    return errorResponse(
      'Error processing request',
      error instanceof Error ? error.message : 'Unknown error',
      500,
    );
  }
}
