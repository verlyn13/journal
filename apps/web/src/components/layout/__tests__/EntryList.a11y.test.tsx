import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EntryList } from '../EntryList';
import type { EntryVm } from '../../../types/entry';

describe('EntryList keyboard accessibility', () => {
  const entries: EntryVm[] = [
    {
      id: 'e1',
      title: 'First Entry',
      preview: 'Preview content',
      date: 'Today',
      time: '10:00',
      wordCount: 10,
      tags: ['t1'],
    },
  ];

  it('allows selecting an entry via keyboard (Enter)', async () => {
    const onSelect = vi.fn();
    render(
      <EntryList
        entries={entries}
        selectedEntry={null}
        onSelectEntry={onSelect}
        onCreateEntry={vi.fn()}
      />,
    );

    const rowButton = await screen.findByRole('button', { name: /First Entry/i });
    rowButton.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('e1');
  });
});
