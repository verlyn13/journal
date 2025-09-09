import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the lazy-loaded MarkdownEditor with a simple textarea
vi.mock('../MarkdownEditor', () => {
  return {
    default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
      <textarea aria-label="md-editor" value={value} onChange={(e) => onChange(e.currentTarget.value)} />
    ),
  };
});

import MarkdownSplitPane from '../MarkdownSplitPane';

describe('MarkdownSplitPane autosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces autosave and sends markdown after 1200ms', async () => {
    const onSave = vi.fn();
    render(
      <MarkdownSplitPane
        entry={{ id: 'e1', title: 'T', content: 'Initial' }}
        onSave={onSave}
      />,
    );

    const editor = await screen.findByLabelText('md-editor');
    fireEvent.change(editor, { target: { value: '# New content' } });

    // Before debounce period: no save
    expect(onSave).not.toHaveBeenCalled();

    // Advance timers to trigger debounce (1200ms)
    vi.advanceTimersByTime(1300);
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ html: '', markdown: '# New content' });
  });
});
