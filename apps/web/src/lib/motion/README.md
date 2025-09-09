# Motion System v2.0

A comprehensive animation and transition orchestration system for the Journal application, providing spring physics, view transitions, and performance-optimized animations.

## Features

- 🎯 **Spring Physics**: Realistic spring-based animations
- 🎭 **View Transitions API**: Native browser transitions support
- ⚡ **Performance Optimized**: RAF-based orchestration with automatic cleanup
- ♿ **Accessibility First**: Respects `prefers-reduced-motion`
- 🎨 **Rich Presets**: 30+ easing functions and motion presets
- 🔧 **React Hooks**: Easy integration with React components
- 📱 **Responsive**: Adapts to device capabilities

## Installation

```typescript
import { 
  useMotion, 
  useSpring, 
  motionPresets,
  springPresets 
} from '@/lib/motion';
```

## Basic Usage

### Simple Animation

```tsx
function AnimatedCard() {
  const { ref, animate, state } = useMotion({
    duration: 400,
    easing: 'ease-out'
  });

  const handleClick = async () => {
    await animate({
      transform: 'translateY(-10px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    });
  };

  return (
    <div ref={ref} onClick={handleClick}>
      {state.isAnimating ? 'Animating...' : 'Click me!'}
    </div>
  );
}
```

### Spring Animation

```tsx
function SpringBox() {
  const { value, set, isAnimating } = useSpring(0, springPresets.bouncy);
  
  return (
    <div 
      style={{ transform: `translateX(${value}px)` }}
      onClick={() => set(value === 0 ? 200 : 0)}
    >
      Bounce me!
    </div>
  );
}
```

### Stagger Animation

```tsx
function StaggerList({ items }) {
  const { delays, animateAll } = useStagger({
    children: items.length,
    delayBetween: 50,
    from: 'first'
  });

  useEffect(() => {
    const elements = document.querySelectorAll('.list-item');
    animateAll(Array.from(elements), {
      opacity: '1',
      transform: 'translateY(0)'
    });
  }, [items]);

  return (
    <ul>
      {items.map((item, i) => (
        <li 
          key={item.id}
          className="list-item"
          style={{ 
            opacity: 0,
            transform: 'translateY(20px)',
            animationDelay: `${delays[i]}ms`
          }}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

### View Transitions

```tsx
function PageTransition() {
  const { startTransition, isSupported } = useViewTransition();
  
  const navigateToPage = async (page: string) => {
    await startTransition({
      name: 'page-transition',
      duration: 300,
      updateCallback: async () => {
        // Update DOM here
        await router.push(page);
      }
    });
  };
  
  if (!isSupported) {
    // Fallback for browsers without View Transitions API
    return <FallbackTransition />;
  }
  
  return <button onClick={() => navigateToPage('/next')}>Next Page</button>;
}
```

### Reduced Motion

```tsx
function AccessibleAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const { ref, animate } = useMotion({
    duration: prefersReducedMotion ? 0 : 400
  });
  
  return (
    <div ref={ref}>
      {prefersReducedMotion 
        ? 'Animations disabled' 
        : 'Smooth animations enabled'}
    </div>
  );
}
```

## Spring Presets

- `gentle`: Smooth, natural motion (default)
- `wobbly`: Playful, bouncy motion
- `stiff`: Quick, snappy motion
- `slow`: Gradual, deliberate motion
- `molasses`: Very slow, heavy motion
- `snappy`: Fast with minimal overshoot
- `bouncy`: Elastic, playful bounce
- `noWobble`: Critically damped, no oscillation

## Motion Presets

- `fadeIn` / `fadeOut`: Opacity transitions
- `slideUp` / `slideDown` / `slideLeft` / `slideRight`: Directional slides
- `scaleIn` / `scaleOut`: Scale transformations
- `rotateIn` / `rotateOut`: Rotation animations
- `bounce`: Bouncing effect
- `pulse`: Pulsing animation (loops)
- `shake`: Shake effect
- `swing`: Swinging motion

## Easing Functions

30+ easing functions including:

- Standard: `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`
- Polynomial: `easeInCubic`, `easeOutQuart`, `easeInOutQuint`
- Trigonometric: `easeInSine`, `easeOutSine`, `easeInOutSine`
- Exponential: `easeInExpo`, `easeOutExpo`, `easeInOutExpo`
- Circular: `easeInCirc`, `easeOutCirc`, `easeInOutCirc`
- Elastic: `easeInElastic`, `easeOutElastic`, `easeInOutElastic`
- Back: `easeInBack`, `easeOutBack`, `easeInOutBack`
- Bounce: `easeInBounce`, `easeOutBounce`, `easeInOutBounce`

## Advanced Usage

### Custom Spring Configuration

```tsx
const customSpring = useSpring(0, {
  stiffness: 200,
  damping: 15,
  mass: 1.5,
  velocity: 0,
  precision: 0.01
});
```

### Timeline Animations

```tsx
const { play, pause, reset, isPlaying } = useTimeline([
  { target: '.header', motion: motionPresets.fadeIn, at: 0 },
  { target: '.content', motion: motionPresets.slideUp, at: 200 },
  { target: '.footer', motion: motionPresets.fadeIn, at: '+100' }
]);
```

### Orchestrator Direct Usage

```typescript
import { getOrchestrator } from '@/lib/motion';

const orchestrator = getOrchestrator();
const spring = orchestrator.createSpring('unique-id', 0, springPresets.gentle);
spring.setTarget(100);
```

## Performance Tips

1. **Use CSS transforms**: Prefer `transform` and `opacity` for best performance
2. **Batch animations**: Group related animations together
3. **Debounce triggers**: Use `debounceMotion` for high-frequency events
4. **Clean up**: Animations auto-cleanup, but cancel if component unmounts early
5. **Reduce motion**: Always respect user preferences

## Browser Support

- Modern browsers with Web Animations API
- View Transitions API (Chrome 111+, Edge 111+)
- Graceful fallbacks for older browsers

## Testing

```bash
bun run test src/lib/motion
```

## License

Part of the Journal application - All rights reserved
