import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MarkdownSplitPane from '../../markdown/MarkdownSplitPane';

describe('MarkdownSplitPane layout toggle', () => {
  it('toggles between side and stack and persists layout', () => {
    localStorage.removeItem('journal:splitpane:layout');
    render(
      <MarkdownSplitPane entry={{ id: '1', title: 'T', content: '# T' }} onSave={undefined} />,
    );
    const pane = screen.getByTestId('splitpane');
    expect(pane.getAttribute('data-layout')).toBe('side');

    const toggle = screen.getByTestId('splitpane-toggle');
    fireEvent.click(toggle);

    expect(pane.getAttribute('data-layout')).toBe('stack');
    expect(localStorage.getItem('journal:splitpane:layout')).toBe('stack');
  });

  // Ratio adjustment is covered interactively; minimal unit test scope per plan
});
