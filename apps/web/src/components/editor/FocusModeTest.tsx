import type React from 'react';

export const FocusModeTest: React.FC = () => {
  return (
    <div className="p-4 bg-sanctuary-bg-primary text-sanctuary-text-primary">
      <h1 className="text-2xl mb-4">Focus Mode Test</h1>
      <button type="button" className="px-4 py-2 bg-sanctuary-accent text-white rounded">
        Test Button
      </button>
      <p className="mt-4">
        This is a test component to verify Tailwind CSS and Sanctuary theme are working.
      </p>
    </div>
  );
};

export default FocusModeTest;
