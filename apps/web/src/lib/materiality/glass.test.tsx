import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Glass, FrostedGlass, Acrylic, supportsBackdropFilter } from './glass';

describe('Glass Component', () => {
  it('renders with default blur and opacity', () => {
    render(<Glass data-testid="glass">Content</Glass>);
    const element = screen.getByTestId('glass');
    expect(element).toHaveClass('glass');
    expect(element).toHaveStyle(
      'background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px) saturate(150%)'
    );
  });

  it('applies custom blur level', () => {
    render(
      <Glass blur="xl" data-testid="glass">
        Content
      </Glass>,
    );
    const element = screen.getByTestId('glass');
    expect(element).toHaveStyle('backdrop-filter: blur(24px) saturate(150%)');
  });

  it('applies custom opacity', () => {
    render(
      <Glass opacity={0.5} data-testid="glass">
        Content
      </Glass>,
    );
    const element = screen.getByTestId('glass');
    expect(element).toHaveStyle('background-color: rgba(255, 255, 255, 0.5)');
  });

  it('applies custom tint color', () => {
    render(
      <Glass tint="#ff0000" data-testid="glass">
        Content
      </Glass>,
    );
    const element = screen.getByTestId('glass');
    expect(element).toHaveStyle('background-color: rgba(255, 0, 0, 0.8)');
  });

  it('applies custom saturation', () => {
    render(
      <Glass saturation={2} data-testid="glass">
        Content
      </Glass>,
    );
    const element = screen.getByTestId('glass');
    expect(element).toHaveStyle('backdrop-filter: blur(8px) saturate(200%)');
  });

  it('combines multiple properties', () => {
    render(
      <Glass
        blur="lg"
        opacity={0.9}
        saturation={1.2}
        tint="#0000ff"
        className="custom-glass"
        data-testid="glass"
      >
        Content
      </Glass>,
    );
    const element = screen.getByTestId('glass');
    expect(element).toHaveClass('glass', 'custom-glass');
    expect(element).toHaveStyle(
      'background-color: rgba(0, 0, 255, 0.9); backdrop-filter: blur(16px) saturate(120%)'
    );
  });
});

describe('FrostedGlass Component', () => {
  it('renders with frosted defaults', () => {
    render(<FrostedGlass data-testid="frosted">Content</FrostedGlass>);
    const element = screen.getByTestId('frosted');
    expect(element).toHaveClass('glass');
    expect(element).toHaveStyle(
      'background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px) saturate(120%)'
    );
  });

  it('accepts prop overrides', () => {
    render(
      <FrostedGlass blur="xl" opacity={0.8} data-testid="frosted">
        Content
      </FrostedGlass>,
    );
    const element = screen.getByTestId('frosted');
    expect(element).toHaveStyle(
      'background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(24px) saturate(120%)'
    );
  });
});

describe('Acrylic Component', () => {
  it('renders with acrylic defaults', () => {
    render(<Acrylic data-testid="acrylic">Content</Acrylic>);
    const element = screen.getByTestId('acrylic');
    expect(element).toHaveClass('glass', 'acrylic');
    expect(element).toHaveStyle(
      'background-color: rgba(243, 243, 243, 0.6); backdrop-filter: blur(24px) saturate(150%)'
    );
  });

  it('accepts custom tint', () => {
    render(
      <Acrylic tint="#ffffff" data-testid="acrylic">
        Content
      </Acrylic>,
    );
    const element = screen.getByTestId('acrylic');
    expect(element).toHaveStyle('background-color: rgba(255, 255, 255, 0.6)');
  });

  it('accepts prop overrides', () => {
    render(
      <Acrylic blur="lg" opacity={0.8} data-testid="acrylic">
        Content
      </Acrylic>,
    );
    const element = screen.getByTestId('acrylic');
    expect(element).toHaveStyle(
      'background-color: rgba(243, 243, 243, 0.8); backdrop-filter: blur(16px) saturate(150%)'
    );
  });
});

describe('supportsBackdropFilter', () => {
  it('returns true when backdrop-filter is supported', () => {
    // Already mocked in test-setup.ts to return true
    expect(supportsBackdropFilter()).toBe(true);
  });

  // Note: Testing the false case is difficult due to how CSS.supports
  // is globally mocked in the test environment. The implementation is
  // simple enough that we can rely on the positive test case.
});
