import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock the lazy-loaded MarkdownEditor with a simple textarea
vi.mock('../MarkdownEditor', () => {
  return {
    default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
      <textarea
        aria-label="md-editor"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    ),
  };
});

vi.mock('../MarkdownPreview', () => {
  return {
    default: ({ markdown }: { markdown: string }) => <div data-testid="md-preview">{markdown}</div>,
  };
});

import MarkdownSplitPane from '../MarkdownSplitPane';

describe('MarkdownSplitPane autosave', () => {
  it('debounces autosave and sends markdown after specified time', async () => {
    const onSave = vi.fn();

    render(
      <MarkdownSplitPane
        entry={{ id: 'e1', title: 'T', content: 'Initial' }}
        onSave={onSave}
        autosaveMs={50} // Short delay for testing
      />,
    );

    // Wait for lazy-loaded components to render and initial save
    const editor = await screen.findByLabelText('md-editor');

    // Wait for initial autosave to complete
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ html: '', markdown: 'Initial' });
    });

    // Clear the mock to test the next save
    onSave.mockClear();

    // Change content - this should trigger the debounced save
    fireEvent.change(editor, { target: { value: '# New content' } });

    // Immediately after change: no save yet (debouncing)
    expect(onSave).not.toHaveBeenCalled();

    // Wait for the debounced save to be called
    await waitFor(
      () => {
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith({ html: '', markdown: '# New content' });
      },
      { timeout: 200 },
    );
  });
});
