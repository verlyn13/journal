import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MarkdownPreview from '../MarkdownPreview';

describe('MarkdownPreview Sanitization', () => {
  it.skip('blocks dangerous content', () => {
    const dangerous = '# Safe\n\n<script>alert("xss")</script>\n\nContent after script';
    render(<MarkdownPreview markdown={dangerous} />);
    expect(screen.queryByText('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('xss')).not.toBeInTheDocument();
    expect(screen.getByText('Safe')).toBeInTheDocument();
    expect(screen.getByText('Content after script')).toBeInTheDocument();
  });

  it.skip('preserves KaTeX classes', () => {
    const math = '$E = mc^2$';
    const { container } = render(<MarkdownPreview markdown={math} />);
    expect(container.querySelector('.katex')).toBeInTheDocument();
  });

  it.skip('highlights code blocks', () => {
    const code = '```javascript\nconst x = 42;\n```';
    const { container } = render(<MarkdownPreview markdown={code} />);
    expect(container.querySelector('.hljs')).toBeInTheDocument();
  });
});
