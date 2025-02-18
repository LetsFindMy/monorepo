export type RateLimitIdentifier = `${string}:${string}`;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface PrismaConfig {
  log: Array<'error' | 'warn' | 'info' | 'query'>;
  connectionTimeout: number;
  pool: {
    min: number;
    max: number;
  };
}
