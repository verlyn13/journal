/**
 * Utility types for type branding and safety
 */

// Generic brand type
export type Brand<K, T> = K & { readonly __brand: T };

// Common branded types
export type NonEmptyString = Brand<string, 'NonEmptyString'>;
export type EmailAddress = Brand<string, 'EmailAddress'>;
export type URL = Brand<string, 'URL'>;
export type ISODateString = Brand<string, 'ISODateString'>;

// Type guards
export function isNonEmptyString(value: unknown): value is NonEmptyString {
  return typeof value === 'string' && value.length > 0;
}

export function isEmailAddress(value: unknown): value is EmailAddress {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isURL(value: unknown): value is URL {
  if (typeof value !== 'string') return false;
  try {
    new globalThis.URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isISODateString(value: unknown): value is ISODateString {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

// Converters
export function toNonEmptyString(value: string): NonEmptyString {
  if (!isNonEmptyString(value)) {
    throw new Error('String cannot be empty');
  }
  return value;
}

export function toEmailAddress(value: string): EmailAddress {
  if (!isEmailAddress(value)) {
    throw new Error(`Invalid email address: ${value}`);
  }
  return value;
}

export function toURL(value: string): URL {
  if (!isURL(value)) {
    throw new Error(`Invalid URL: ${value}`);
  }
  return value as URL;
}

export function toISODateString(value: string | Date): ISODateString {
  const dateStr = typeof value === 'string' ? value : value.toISOString();
  if (!isISODateString(dateStr)) {
    throw new Error(`Invalid ISO date string: ${dateStr}`);
  }
  return dateStr;
}
