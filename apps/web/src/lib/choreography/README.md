# Choreography System v2.0

A comprehensive animation orchestration system for coordinating complex UI transitions, gestures, and layout animations.

## Features

- 🎭 **Animation Orchestration**: Coordinate complex multi-element animations
- ⏱️ **Timeline Control**: Sequential and parallel animation management
- 👆 **Gesture Coordination**: Swipe, pinch, drag, and tap detection
- 🔄 **Layout Transitions**: FLIP animations and morphing effects
- ♿ **Accessibility**: Full respect for prefers-reduced-motion
- 🎯 **Preset Animations**: Entry morphing, sidebar collapse, focus mode
- 🪝 **React Hooks**: Easy integration with React components

## Installation

```typescript
import {
  useChoreography,
  useTimeline,
  useGestures,
  useLayoutTransition,
  ChoreographyOrchestrator,
} from '@/lib/choreography';
```

## Basic Usage

### Choreography Sequences

```tsx
const sequence = {
  id: 'entry-create',
  name: 'Entry Creation Animation',
  steps: [
    {
      target: '.create-button',
      animation: {
        keyframes: [
          { transform: 'scale(1)', opacity: '1' },
          { transform: 'scale(1.5)', opacity: '0' },
        ],
      },
      duration: 300,
    },
    {
      target: '.editor',
      animation: {
        keyframes: [
          { transform: 'scale(0.8) translateY(20px)', opacity: '0' },
          { transform: 'scale(1) translateY(0)', opacity: '1' },
        ],
      },
      duration: 400,
      delay: 100,
    },
  ],
};

function CreateEntry() {
  const { play, stop, state, progress } = useChoreography(sequence);
  
  return (
    <button onClick={play}>
      Create Entry (Animation {Math.round(progress * 100)}%)
    </button>
  );
}
```

### Timeline Animations

```tsx
function AnimatedList() {
  const { timeline, play } = useTimeline({ duration: 1000 });
  
  useEffect(() => {
    timeline
      .add('.header', [
        { opacity: '0', transform: 'translateY(-20px)' },
        { opacity: '1', transform: 'translateY(0)' },
      ], { duration: 300 })
      .add('.list-item', [
        { opacity: '0', transform: 'translateX(-20px)' },
        { opacity: '1', transform: 'translateX(0)' },
      ], { duration: 200, position: '+=50' });
    
    play();
  }, []);
  
  return <div>...</div>;
}
```

### Gesture Handling

```tsx
function SwipeableCard() {
  const { ref, onSwipe, onPinch } = useGestures({
    threshold: 50,
    direction: 'horizontal',
  });
  
  onSwipe((event) => {
    if (event.direction === 'left') {
      // Handle left swipe
    }
  });
  
  onPinch((event) => {
    // Handle pinch zoom
    console.log('Scale:', event.scale);
  });
  
  return <div ref={ref}>Swipe me!</div>;
}
```

### Layout Transitions

```tsx
function ExpandableCard() {
  const { capture, transition } = useLayoutTransition();
  const [expanded, setExpanded] = useState(false);
  
  const handleToggle = async () => {
    capture('card', '.card');
    setExpanded(!expanded);
    await transition('card', { type: 'morph', duration: 400 });
  };
  
  return (
    <div className={`card ${expanded ? 'expanded' : ''}`} onClick={handleToggle}>
      Content
    </div>
  );
}
```

## Preset Animations

### Entry Morphing

```tsx
import { presetTimelines } from '@/lib/choreography';

const entryMorph = presetTimelines.entryMorph();
entryMorph.play();
```

### Sidebar Collapse

```tsx
const sidebarCollapse = presetTimelines.sidebarCollapse();
sidebarCollapse.play();
```

### Focus Mode

```tsx
const focusMode = presetTimelines.focusMode();
focusMode.play();
```

## Advanced Features

### Stagger Animations

```tsx
function StaggeredList({ items }) {
  const itemsRef = useRef<HTMLElement[]>([]);
  const { animate } = useStagger(itemsRef, {
    stagger: 50,
    duration: 300,
  });
  
  useEffect(() => {
    animate();
  }, [items]);
  
  return items.map((item, i) => (
    <div key={i} ref={el => itemsRef.current[i] = el}>
      {item}
    </div>
  ));
}
```

### Entrance/Exit Animations

```tsx
function AnimatedModal({ isOpen, onClose }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEntrance(ref, {
    delay: 100,
    duration: 400,
  });
  
  useExit(ref, !isOpen, {
    duration: 200,
    onComplete: onClose,
  });
  
  return <div ref={ref}>Modal Content</div>;
}
```

## Configuration

### Global Orchestrator

```tsx
const orchestrator = new ChoreographyOrchestrator();

// Register multiple sequences
orchestrator.registerSequence(entryCreateSequence);
orchestrator.registerSequence(sidebarSequence);

// Play sequences
await orchestrator.play('entry-create');
```

### Reduced Motion

The system automatically respects `prefers-reduced-motion`:

- Animations are skipped and final states applied instantly
- Gesture thresholds are increased
- Transitions use instant changes instead of animations

## Performance

- Uses Web Animations API for optimal performance
- Automatic cleanup of completed animations
- RAF-based timeline for smooth 60fps animations
- Efficient batch updates for group animations

## Browser Support

- Modern browsers with Web Animations API support
- Fallback to CSS transitions for older browsers
- Touch events for mobile devices
- Mouse events for desktop

## Testing

```bash
bun test src/lib/choreography
```

## License

Part of the Journal application - All rights reserved
