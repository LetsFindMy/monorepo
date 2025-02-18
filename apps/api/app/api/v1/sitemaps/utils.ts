import { NextResponse } from 'next/server';

// Types using modern TypeScript features
export type ApiResponse<T = unknown> = Readonly<{
  message: string;
  data?: T;
  errors?: unknown;
}>;

export type FetchResult = Readonly<{
  url: string;
  content?: string;
  error?: string;
}>;

// Response helpers using arrow functions
export const createResponse = <T>(
  data: ApiResponse<T>,
  status: number,
): NextResponse => NextResponse.json(data, { status });

export const errorResponse = (
  message: string,
  errors: unknown,
  status: number,
): NextResponse => createResponse({ message, errors }, status);

export const successResponse = <T>(message: string, data: T): NextResponse =>
  createResponse({ message, data }, 201);

// URL validation using modern URL API
export const isValidUrl = (url: string): boolean => {
  try {
    return new URL(url).protocol.toLowerCase().startsWith('http');
  } catch {
    return false;
  }
};

// Fetch XML content with modern fetch API features
export const fetchXmlContent = async (url: string): Promise<FetchResult> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(url, {
      headers: {
        Accept: 'application/xml, text/xml',
      },
      next: {
        revalidate: 43200, // Cache for 12 hours
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType =
      response.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.includes('xml')) {
      throw new Error('Response is not XML content');
    }

    const content = await response.text();
    return { url, content };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch XML content';
    return { url, error: errorMessage };
  }
};
