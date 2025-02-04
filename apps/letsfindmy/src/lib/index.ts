// index.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sanitizeFormName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9-]/g, '');
};
