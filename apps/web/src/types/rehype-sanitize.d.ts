/**
 * Type definitions for rehype-sanitize schema
 */

export type AttributeContent = string | RegExp | [string, string | RegExp] | null;
export type AttributeList = Array<AttributeContent>;

export interface Schema {
  strip?: string[];
  clobberPrefix?: string;
  clobber?: string[];
  ancestors?: Record<string, string[]>;
  protocols?: Record<string, string[]>;
  tagNames?: string[];
  attributes?: Record<string, AttributeList>;
  required?: Record<string, Record<string, string>>;
}

declare module 'rehype-sanitize' {
  export const defaultSchema: Schema;
}
