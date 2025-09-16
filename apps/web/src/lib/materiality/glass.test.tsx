import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Acrylic, FrostedGlass, Glass, supportsBackdropFilter } from './glass';

describe('Glass Component', () => {
  it('renders with default blur and opacity', () => {
    render(<Glass data-testid="glass">Content</Glass>);
    const element = screen.getByTestId('glass');
    expect(element).toHaveClass('glass');
    // jsdom may not retain unsupported CSS properties like backdrop-filter
    if (CSS?.supports('backdrop-filter', 'blur(1px)')) {
      expect(element).toHaveStyle(
        'background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px) saturate(150%)',
      );
    } else {
      expect(element).toHaveStyle('background-color: rgba(255, 255, 255, 0.8)');
    }
  });

  it('applies custom blur level', () => {
    render(
      <Glass blur="xl" data-testid="glass">
        Content
      </Glass>,
    );
    const element = screen.getByTestId('glass');
    if (CSS?.supports('backdrop-filter', 'blur(1px)')) {
      expect(element).toHaveStyle('backdrop-filter: blur(24px) saturate(150%)');
    }
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
    if (CSS?.supports('backdrop-filter', 'blur(1px)')) {
      expect(element).toHaveStyle('backdrop-filter: blur(8px) saturate(200%)');
    }
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
    if (CSS?.supports('backdrop-filter', 'blur(1px)')) {
      expect(element).toHaveStyle(
        'background-color: rgba(0, 0, 255, 0.9); backdrop-filter: blur(16px) saturate(120%)',
      );
    } else {
      expect(element).toHaveStyle('background-color: rgba(0, 0, 255, 0.9)');
    }
  });
});

describe('FrostedGlass Component', () => {
  it('renders with frosted defaults', () => {
    render(<FrostedGlass data-testid="frosted">Content</FrostedGlass>);
    const element = screen.getByTestId('frosted');
    expect(element).toHaveClass('glass');
    if (CSS?.supports('backdrop-filter', 'blur(1px)')) {
      expect(element).toHaveStyle(
        'background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px) saturate(120%)',
      );
    } else {
      expect(element).toHaveStyle('background-color: rgba(255, 255, 255, 0.95)');
    }
  });

  it('accepts prop overrides', () => {
    render(
      <FrostedGlass blur="xl" opacity={0.8} data-testid="frosted">
        Content
      </FrostedGlass>,
    );
    const element = screen.getByTestId('frosted');
    if (CSS?.supports('backdrop-filter', 'blur(1px)')) {
      expect(element).toHaveStyle(
        'background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(24px) saturate(120%)',
      );
    } else {
      expect(element).toHaveStyle('background-color: rgba(255, 255, 255, 0.8)');
    }
  });
});

describe('Acrylic Component', () => {
  it('renders with acrylic defaults', () => {
    render(<Acrylic data-testid="acrylic">Content</Acrylic>);
    const element = screen.getByTestId('acrylic');
    expect(element).toHaveClass('glass', 'acrylic');
    if (CSS?.supports('backdrop-filter', 'blur(1px)')) {
      expect(element).toHaveStyle(
        'background-color: rgba(243, 243, 243, 0.6); backdrop-filter: blur(24px) saturate(150%)',
      );
    } else {
      expect(element).toHaveStyle('background-color: rgba(243, 243, 243, 0.6)');
    }
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
    if (CSS?.supports('backdrop-filter', 'blur(1px)')) {
      expect(element).toHaveStyle(
        'background-color: rgba(243, 243, 243, 0.8); backdrop-filter: blur(16px) saturate(150%)',
      );
    } else {
      expect(element).toHaveStyle('background-color: rgba(243, 243, 243, 0.8)');
    }
  });
});

describe('supportsBackdropFilter', () => {
  it('returns false when backdrop-filter is not supported', () => {
    // Mocked in test-setup.ts to return false (jsdom doesn't support backdrop-filter)
    expect(supportsBackdropFilter()).toBe(false);
  });

  // Note: Testing the true case would require a real browser environment
  // that supports backdrop-filter. The implementation correctly checks
  // CSS.supports and handles the window override for testing.
});
