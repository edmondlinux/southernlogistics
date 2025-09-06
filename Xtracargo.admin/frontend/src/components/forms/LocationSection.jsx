
import React from 'react';
import { MapPin } from 'lucide-react';
import OpenStreetMap from '../OpenStreetMap';

const LocationSection = ({ coordinates, setCoordinates }) => {
  return (
    <div className="mt-8">
      <div className="bg-gray-800 rounded-lg p-1">
        <div className="flex items-center mb-4">
          <MapPin className="w-6 h-6 text-emerald-400 mr-2" />
          <h3 className="text-xl font-semibold text-emerald-400">
            Update Shipment Location
          </h3>
        </div>
        <OpenStreetMap 
          height="400px" 
          defaultZoom={2} 
          onCoordinatesChange={setCoordinates}
          selectedCoordinates={coordinates}
          interactive={true}
        />
      </div>
    </div>
  );
};

export default LocationSection;
