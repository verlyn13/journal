import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Surface, Card, Paper, FloatingPanel } from './surfaces';

describe('Surface Component', () => {
  it('renders flat surface by default', () => {
    render(<Surface data-testid="surface">Content</Surface>);
    const element = screen.getByTestId('surface');
    expect(element).toHaveClass('surface', 'surface--flat');
    expect(element).toHaveAttribute('data-elevation', '0');
  });

  it('applies raised variant with elevation', () => {
    render(
      <Surface variant="raised" elevation={2} data-testid="surface">
        Content
      </Surface>,
    );
    const element = screen.getByTestId('surface');
    expect(element).toHaveClass('surface', 'surface--raised');
    expect(element).toHaveAttribute('data-elevation', '2');
  });

  it('applies texture styles', () => {
    render(
      <Surface texture="paper" data-testid="surface">
        Content
      </Surface>,
    );
    const element = screen.getByTestId('surface');
    expect(element).toHaveClass('texture-paper');
  });

  it('applies vibrant effect', () => {
    render(
      <Surface vibrant data-testid="surface">
        Content
      </Surface>,
    );
    const element = screen.getByTestId('surface');
    expect(element).toHaveStyle({ backdropFilter: 'blur(20px) saturate(180%)' });
  });

  it('combines multiple properties', () => {
    render(
      <Surface variant="floating" elevation={3} texture="canvas" data-testid="surface">
        Content
      </Surface>,
    );
    const element = screen.getByTestId('surface');
    expect(element).toHaveClass('surface', 'surface--floating', 'texture-canvas');
    expect(element).toHaveAttribute('data-elevation', '3');
  });
});

describe('Card Component', () => {
  it('renders as raised surface with interactive elevation', () => {
    render(<Card data-testid="card">Card Content</Card>);
    const element = screen.getByTestId('card');
    expect(element).toHaveClass('surface', 'surface--raised', 'card');
    expect(element).toHaveAttribute('data-elevation', '1');
    expect(element).toHaveAttribute('data-interactive', 'true');
  });

  it('accepts custom elevation', () => {
    render(
      <Card elevation={2} data-testid="card">
        Content
      </Card>,
    );
    const element = screen.getByTestId('card');
    expect(element).toHaveAttribute('data-elevation', '2');
  });

  it('disables interactive behavior when specified', () => {
    render(
      <Card interactive={false} data-testid="card">
        Content
      </Card>,
    );
    const element = screen.getByTestId('card');
    expect(element).toHaveAttribute('data-interactive', 'false');
  });
});

describe('Paper Component', () => {
  it('renders flat surface with paper texture by default', () => {
    render(<Paper data-testid="paper">Document</Paper>);
    const element = screen.getByTestId('paper');
    expect(element).toHaveClass('surface', 'surface--flat', 'paper', 'texture-paper');
    expect(element).toHaveAttribute('data-elevation', '0');
  });

  it('accepts custom texture', () => {
    render(
      <Paper texture="linen" data-testid="paper">
        Content
      </Paper>,
    );
    const element = screen.getByTestId('paper');
    expect(element).toHaveClass('texture-linen');
    expect(element).not.toHaveClass('texture-paper');
  });
});

describe('FloatingPanel Component', () => {
  it('renders floating surface with high elevation', () => {
    render(<FloatingPanel data-testid="panel">Panel</FloatingPanel>);
    const element = screen.getByTestId('panel');
    expect(element).toHaveClass('surface', 'surface--floating', 'floating-panel');
    expect(element).toHaveAttribute('data-elevation', '3');
    // Note: vibrant is now false by default
  });

  it('applies vibrant effect when specified', () => {
    render(
      <FloatingPanel vibrant data-testid="panel">
        Panel
      </FloatingPanel>,
    );
    const element = screen.getByTestId('panel');
    expect(element).toHaveStyle({ backdropFilter: 'blur(20px) saturate(180%)' });
  });

  it('accepts custom elevation override', () => {
    render(
      <FloatingPanel elevation={5} data-testid="panel">
        Panel
      </FloatingPanel>,
    );
    const element = screen.getByTestId('panel');
    expect(element).toHaveAttribute('data-elevation', '5');
  });
});
