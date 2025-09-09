import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

// Mock the lazy-loaded MarkdownEditor with a simple textarea
vi.mock('../MarkdownEditor', () => {
  return {
    default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
      <textarea aria-label="md-editor" value={value} onChange={(e) => onChange(e.currentTarget.value)} />
    ),
  };
});

vi.mock('../MarkdownPreview', () => {
  return {
    default: ({ markdown }: { markdown: string }) => (
      <div data-testid="md-preview">{markdown}</div>
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

  it('debounces autosave and sends markdown after specified time', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <MarkdownSplitPane
        entry={{ id: 'e1', title: 'T', content: 'Initial' }}
        onSave={onSave}
        autosaveMs={100}
      />,
    );

    const editor = await screen.findByLabelText('md-editor');
    
    // Change content
    await act(async () => {
      fireEvent.change(editor, { target: { value: '# New content' } });
    });

    // Before debounce period: no save
    expect(onSave).not.toHaveBeenCalled();

    // Advance timers to trigger debounce and flush promises
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    
    // Wait for the save to complete
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1), { timeout: 1000 });
    expect(onSave).toHaveBeenCalledWith({ html: '', markdown: '# New content' });
  });
});
