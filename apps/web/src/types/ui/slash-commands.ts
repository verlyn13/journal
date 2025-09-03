/**
 * Type definitions for Slash Commands extension
 */

import type { Editor as TiptapEditor } from '@tiptap/core';

export interface SlashCommandItem {
  title: string;
  emoji?: string;
  section?: 'Blocks' | 'Templates';
  command: (props: { editor: TiptapEditor }) => void;
}

export interface SlashCommandProps {
  items: SlashCommandItem[];
  clientRect?: (() => DOMRect) | null;
  command: (item: SlashCommandItem) => void;
}

export interface SlashCommandKeyDownProps {
  items: SlashCommandItem[];
  event: KeyboardEvent;
  command?: (item: SlashCommandItem) => void;
}

// Type guard to check if command exists
export function hasCommand(props: unknown): props is { command: (item: SlashCommandItem) => void } {
  return (
    typeof props === 'object' &&
    props !== null &&
    'command' in props &&
    typeof (props as Record<string, unknown>).command === 'function'
  );
}
