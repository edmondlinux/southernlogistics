
import React from 'react';
import { MapPin } from 'lucide-react';
import OpenStreetMap from '../OpenStreetMap';

const LocationSection = ({ coordinates, setCoordinates }) => {
  return (
    <div className="bg-gray-700 p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-medium text-white">Location</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Shipment Location on Map
          </label>
          <OpenStreetMap
            height="400px"
            defaultZoom={2}
            selectedCoordinates={coordinates}
            onCoordinatesChange={setCoordinates}
            interactive={true}
          />
        </div>

        {coordinates && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Latitude
              </label>
              <input
                type="text"
                value={coordinates.latitude.toFixed(6)}
                readOnly
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Longitude
              </label>
              <input
                type="text"
                value={coordinates.longitude.toFixed(6)}
                readOnly
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSection;
