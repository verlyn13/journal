import type { Meta, StoryObj } from '@storybook/react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CodeBlockMonaco } from './extensions/CodeBlockMonaco';
import './extensions/CodeBlockMonaco.css';

const meta: Meta = {
  title: 'Editor/CodeBlockMonaco',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A powerful code block component powered by Monaco Editor with syntax highlighting, line numbers, copy functionality, and language selection.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Wrapper component to provide editor context
function EditorWrapper({
  content,
  initialCode = '',
  language = 'javascript',
}: {
  content?: string;
  initialCode?: string;
  language?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default to use Monaco
      }),
      CodeBlockMonaco,
    ],
    content:
      content ||
      `
      <h1>Monaco Code Editor</h1>
      <p>This enhanced code block provides a full Monaco editor experience with:</p>
      <ul>
        <li>Syntax highlighting for 15+ languages</li>
        <li>Line numbers and code folding</li>
        <li>Copy to clipboard functionality</li>
        <li>Expandable/collapsible view</li>
        <li>Sanctuary theme integration</li>
      </ul>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none min-h-96 p-6',
      },
    },
    onCreate: ({ editor }) => {
      if (initialCode) {
        // Insert a code block with initial content
        setTimeout(() => {
          editor
            .chain()
            .focus()
            .insertContent({
              type: 'codeBlockMonaco',
              attrs: {
                language: language,
                code: initialCode,
              },
            })
            .run();
        }, 100);
      }
    },
  });

  return (
    <div style={{ width: '900px', maxWidth: '100vw' }}>
      <div
        style={{
          padding: '24px',
          background: 'var(--color-bg, #F5F3F0)',
          borderRadius: '12px',
          border: '1px solid var(--color-border, #DDE3EA)',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

const sampleJavaScript = `// Example React component
import React, { useState, useEffect } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, done: false }]);
      setInput('');
    }
  };

  return (
    <div className="todo-app">
      <h1>My Todo List</h1>
      <div>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className={todo.done ? 'done' : ''}>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;`;

const samplePython = `# Data analysis example
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

def analyze_sales_data(file_path):
    """
    Analyze sales data and create visualizations
    """
    # Load and clean data
    df = pd.read_csv(file_path)
    df['date'] = pd.to_datetime(df['date'])
    df = df.dropna()
    
    # Calculate monthly sales
    monthly_sales = df.groupby(df['date'].dt.to_period('M'))['amount'].sum()
    
    # Create trend analysis
    X = np.arange(len(monthly_sales)).reshape(-1, 1)
    y = monthly_sales.values
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Plot results
    plt.figure(figsize=(12, 6))
    plt.plot(monthly_sales.index.astype(str), monthly_sales.values, 'bo-', label='Actual')
    plt.plot(monthly_sales.index.astype(str), model.predict(X), 'r--', label='Trend')
    plt.title('Monthly Sales Analysis')
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()
    
    return {
        'total_sales': df['amount'].sum(),
        'avg_monthly': monthly_sales.mean(),
        'trend_slope': model.coef_[0]
    }

# Example usage
results = analyze_sales_data('sales_data.csv')
print(f"Total sales: \${results['total_sales']:,.2f}")`;

const sampleSQL = `-- Advanced SQL query for e-commerce analytics
WITH monthly_metrics AS (
  SELECT 
    DATE_TRUNC('month', order_date) as month,
    COUNT(DISTINCT user_id) as unique_customers,
    COUNT(*) as total_orders,
    SUM(total_amount) as revenue,
    AVG(total_amount) as avg_order_value
  FROM orders 
  WHERE order_date >= '2024-01-01'
    AND status = 'completed'
  GROUP BY DATE_TRUNC('month', order_date)
),
cohort_analysis AS (
  SELECT 
    first_order_month,
    period_number,
    COUNT(DISTINCT user_id) as customers,
    COUNT(DISTINCT user_id) * 100.0 / 
      FIRST_VALUE(COUNT(DISTINCT user_id)) OVER (
        PARTITION BY first_order_month 
        ORDER BY period_number
      ) as retention_rate
  FROM (
    SELECT 
      user_id,
      DATE_TRUNC('month', MIN(order_date)) as first_order_month,
      EXTRACT(
        MONTH FROM AGE(order_date, MIN(order_date) OVER (PARTITION BY user_id))
      ) as period_number
    FROM orders
    WHERE status = 'completed'
    GROUP BY user_id, order_date
  ) cohort_data
  GROUP BY first_order_month, period_number
)
SELECT 
  mm.month,
  mm.unique_customers,
  mm.total_orders,
  mm.revenue,
  mm.avg_order_value,
  ROUND(mm.revenue::numeric / LAG(mm.revenue) OVER (ORDER BY mm.month) - 1, 3) as revenue_growth,
  ca.retention_rate
FROM monthly_metrics mm
LEFT JOIN cohort_analysis ca 
  ON mm.month = ca.first_order_month 
  AND ca.period_number = 1
ORDER BY mm.month DESC;`;

export const Default: Story = {
  render: () => <EditorWrapper initialCode={sampleJavaScript} language="javascript" />,
  parameters: {
    docs: {
      description: {
        story:
          'A default Monaco code block with JavaScript syntax highlighting, showing a React component example.',
      },
    },
  },
};

export const PythonCode: Story = {
  render: () => <EditorWrapper initialCode={samplePython} language="python" />,
  parameters: {
    docs: {
      description: {
        story:
          'Monaco editor with Python syntax highlighting, showing a data analysis script example.',
      },
    },
  },
};

export const SQLCode: Story = {
  render: () => <EditorWrapper initialCode={sampleSQL} language="sql" />,
  parameters: {
    docs: {
      description: {
        story: 'Monaco editor with SQL syntax highlighting, showing an advanced analytics query.',
      },
    },
  },
};

export const EmptyCodeBlock: Story = {
  render: () => <EditorWrapper initialCode="" language="javascript" />,
  parameters: {
    docs: {
      description: {
        story:
          'An empty code block ready for input, showing the loading state and language selector.',
      },
    },
  },
};

export const MultipleLanguages: Story = {
  render: () => {
    const content = `
      <h1>Multiple Code Languages</h1>
      <p>This editor supports syntax highlighting for many programming languages. Each code block can have a different language selected.</p>
    `;

    return <EditorWrapper content={content} />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows how different programming languages are supported with appropriate syntax highlighting.',
      },
    },
  },
};

export const WithCopyFeature: Story = {
  render: () => (
    <EditorWrapper
      initialCode="console.log('Click the copy button in the top right!');\n// The copy functionality works with the clipboard API\nawait navigator.clipboard.writeText(code);"
      language="javascript"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the copy-to-clipboard functionality. Click the copy button to copy the code.',
      },
    },
  },
};

export const ExpandableView: Story = {
  render: () => (
    <EditorWrapper
      initialCode={`${sampleJavaScript}\n\n${'// Additional lines to demonstrate expansion...\n'.repeat(10)}`}
      language="javascript"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows the expand/collapse functionality for better code viewing. Click the expand button to see more content.',
      },
    },
  },
};

export const DarkMode: Story = {
  render: () => (
    <div
      style={{
        backgroundColor: '#2C303A',
        color: '#D4D6D9',
        padding: '24px',
        borderRadius: '12px',
        minHeight: '600px',
      }}
    >
      <EditorWrapper initialCode={sampleJavaScript} language="javascript" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Monaco code block in dark mode using the Dusk theme from the Sanctuary design system.',
      },
    },
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#2C303A' }],
    },
  },
};

export const Responsive: Story = {
  render: () => (
    <div style={{ width: '320px' }}>
      <EditorWrapper
        initialCode="// Mobile-optimized view\nfunction mobileApp() {\n  return (\n    <div className='mobile'>\n      <h1>Mobile App</h1>\n    </div>\n  );\n}"
        language="javascript"
      />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'The code block adapts to mobile screens with adjusted header layout and responsive sizing.',
      },
    },
  },
};

export const LoadingState: Story = {
  render: () => {
    // Create a delayed loading story
    return (
      <EditorWrapper
        initialCode="// This simulates the loading state you see when Monaco is being initialized"
        language="typescript"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state displayed while Monaco editor is being initialized.',
      },
    },
  },
};
