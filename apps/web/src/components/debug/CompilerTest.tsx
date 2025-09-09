import { useState, useCallback, memo } from 'react';

/**
 * Test component to verify React Compiler optimizations
 * The compiler should automatically memoize components and callbacks
 */

interface ExpensiveChildProps {
  value: number;
  onClick: () => void;
}

// This component would normally re-render on every parent render
// React Compiler should automatically memoize it
function ExpensiveChild({ value, onClick }: ExpensiveChildProps) {
  console.log('ExpensiveChild rendered with value:', value);
  
  // Expensive computation that should be optimized
  const computed = Array.from({ length: 1000 }, (_, i) => i * value).reduce((a, b) => a + b, 0);
  
  return (
    <div className="p-4 border rounded">
      <h3>Expensive Child Component</h3>
      <p>Value: {value}</p>
      <p>Computed: {computed}</p>
      <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded">
        Click me
      </button>
    </div>
  );
}

export function CompilerTest() {
  const [count, setCount] = useState(0);
  const [unrelated, setUnrelated] = useState(0);
  
  // This callback would normally be recreated on every render
  // React Compiler should automatically memoize it
  const handleChildClick = () => {
    console.log('Child clicked');
    setCount(c => c + 1);
  };
  
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">React Compiler Test</h2>
      
      <div className="space-x-4">
        <button 
          onClick={() => setUnrelated(u => u + 1)}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Update Unrelated State ({unrelated})
        </button>
        
        <span>Count: {count}</span>
      </div>
      
      {/* This child should NOT re-render when unrelated state changes */}
      <ExpensiveChild value={count} onClick={handleChildClick} />
      
      <div className="text-sm text-gray-600">
        <p>With React Compiler enabled:</p>
        <ul className="list-disc list-inside">
          <li>ExpensiveChild should NOT re-render when clicking "Update Unrelated State"</li>
          <li>Callbacks are automatically memoized</li>
          <li>Check console for render logs</li>
        </ul>
      </div>
    </div>
  );
}

// Export a manually memoized version for comparison
export const MemoizedCompilerTest = memo(CompilerTest);