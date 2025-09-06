
import React, { useState } from 'react';

const ManualCoordinateInput = ({ onLocationSelect }) => {
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const handleManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
      return;
    }
    
    onLocationSelect({ latitude: lat, longitude: lng });
    setManualLat('');
    setManualLng('');
  };

  return (
    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Manual Coordinate Entry
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="number"
          step="any"
          value={manualLat}
          onChange={(e) => setManualLat(e.target.value)}
          placeholder="Latitude (-90 to 90)"
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="number"
          step="any"
          value={manualLng}
          onChange={(e) => setManualLng(e.target.value)}
          placeholder="Longitude (-180 to 180)"
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={handleManualCoordinates}
          disabled={!manualLat || !manualLng}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 font-medium transition-colors"
        >
          Go to Location
        </button>
      </div>
      <div className="mt-1 text-xs text-gray-400">
        Example: 40.7128, -74.0060 (New York City)
      </div>
    </div>
  );
};

export default ManualCoordinateInput;
