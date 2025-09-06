
import React from 'react';

const InteractiveInstructions = ({ interactive }) => {
  if (!interactive) return null;

  return (
    <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
      <strong>Interactive Mode:</strong> 
      <ul className="mt-1 ml-4 list-disc">
        <li>Search for any location using the search box above</li>
        <li>Enter coordinates manually for precise positioning</li>
        <li>Single tap anywhere on the map to drop a pin</li>
        <li>Double tap to zoom in gradually</li>
        <li>Hold and drag the pin to move its location</li>
        <li>Use the country selector to highlight entire countries</li>
      </ul>
    </div>
  );
};

export default InteractiveInstructions;
