import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Migration/Test',
  parameters: {
    docs: {
      description: {
        component: 'Simple test story for Storybook 9 migration verification',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleTest: Story = {
  render: () => (
    <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
      <h2>✅ Storybook 9 Migration Test</h2>
      <p>If you see this, basic Storybook functionality is working!</p>
      <p>Current version: Testing migration to v9</p>
    </div>
  ),
};

export const InteractionTest: Story = {
  render: () => {
    const [count, setCount] = React.useState(0);

    return (
      <div style={{ padding: '20px' }}>
        <h3>Interactive Component Test</h3>
        <p>Count: {count}</p>
        <button type="button" onClick={() => setCount(count + 1)}>
          Increment
        </button>
      </div>
    );
  },
};

import React from 'react';
