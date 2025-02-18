import { NextResponse } from 'next/server';
import { z } from 'zod';

// Types using modern TypeScript features
type ApiResponse<T = unknown> = Readonly<{
    message: string;
    data?: T;
    errors?: unknown;
}>;

type FetchResult = Readonly<{
    url: string;
    content?: string;
    error?: string;
}>;

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

// Schema with more specific validation
const postSchema = z.object({
    data: z.array(z.string().url().trim()).min(1).max(100)
}).strict();

// Response helpers using arrow functions
const createResponse = <T>(data: ApiResponse<T>, status: number): NextResponse =>
    NextResponse.json(data, { status });

const errorResponse = (message: string, errors: unknown, status: number): NextResponse =>
    createResponse({ message, errors }, status);

const successResponse = <T>(message: string, data: T): NextResponse =>
    createResponse({ message, data }, 201);

// URL validation using modern URL API
const isValidUrl = (url: string): boolean => {
    try {
        return new URL(url).protocol.toLowerCase().startsWith('http');
    } catch {
        return false;
    }
};

// Fetch XML content with modern fetch API features
const fetchXmlContent = async (url: string): Promise<FetchResult> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/xml, text/xml',
            },
            next: {
                revalidate: 43200 // Cache for 12 hours
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
        if (!contentType.includes('xml')) {
            throw new Error('Response is not XML content');
        }

        const content = await response.text();
        return { url, content };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch XML content';
        return { url, error: errorMessage };
    }
};

// Validation handlers using modern array methods
const validateUrls = async (urls: ReadonlyArray<string>): Promise<ValidationResult> => {
    const results = await Promise.all(
        urls.map(async (url): Promise<UrlValidationResult> => ({
            url,
            isValid: isValidUrl(url)
        }))
    );

    const invalidUrls = results
        .filter(({ isValid }) => !isValid)
        .map(({ url }) => ({
            url,
            message: 'Invalid URL format or protocol'
        }));

    return {
        isValid: invalidUrls.length === 0,
        invalidUrls
    };
};

// Extract URLs from XML content
const extractUrls = (xmlContent: string): string[] => {
    const matches = xmlContent.match(/<loc>([^<]+)<\/loc>/g) ?? [];
    return matches
        .map(match => match.replace(/<\/?loc>/g, '').trim())
        .filter(url => /product/i.test(url)); // Filter URLs containing 'product' (case insensitive)
};

// Process XML contents and extract URLs
const processXmlContents = (results: ReadonlyArray<FetchResult>): string[] => {
    const validContents = results
        .filter((result): result is FetchResult & { content: string } =>
            result.content !== undefined
        )
        .map(({ content }) => content);

    const allUrls = validContents.flatMap(content => extractUrls(content));
    return [...new Set(allUrls)]; // Remove duplicates
};

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const result = postSchema.safeParse(body);

        if (!result.success) {
            return errorResponse(
                'Invalid request body',
                result.error.errors,
                400
            );
        }

        const { isValid, invalidUrls } = await validateUrls(result.data.data);

        if (!isValid) {
            return errorResponse(
                'Invalid URLs detected',
                invalidUrls,
                400
            );
        }

        const fetchResults = await Promise.all(
            result.data.data.map(url => fetchXmlContent(url))
        );

        const errors = fetchResults.filter((result): result is FetchResult & { error: string } =>
            result.error !== undefined
        );
        const successful = fetchResults.filter((result): result is FetchResult & { content: string } =>
            result.content !== undefined
        );

        if (successful.length === 0) {
            return errorResponse(
                'Failed to fetch XML content from all URLs',
                errors,
                500
            );
        }

        const urls = processXmlContents(successful);

        return successResponse(
            errors.length > 0
                ? 'Partially successful: Some URLs could not be fetched'
                : 'Successfully extracted product URLs from XML content',
            {
                urls,
                errors: errors.length > 0 ? errors : undefined
            }
        );

    } catch (error) {
        return errorResponse(
            'Error processing request',
            error instanceof Error ? error.message : 'Unknown error',
            500
        );
    }
}