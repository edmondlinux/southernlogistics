import React, { useRef } from 'react';
import LocationSearch from './map/LocationSearch';
import ManualCoordinateInput from './map/ManualCoordinateInput';
import CountrySelector from './map/CountrySelector';
import InteractiveInstructions from './map/InteractiveInstructions';
import MapCore from './map/MapCore';

const OpenStreetMap = ({
  height = "400px",
  defaultZoom = 2,
  selectedCoordinates,
  onCoordinatesChange,
  interactive = false,
}) => {
  const mapRef = useRef();

  const handleLocationSelect = (coordinates) => {
    if (onCoordinatesChange) {
      onCoordinatesChange(coordinates);
    }

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [coordinates.longitude, coordinates.latitude],
        zoom: 15,
        duration: 1500
      });
    }
  };

  const handleMapReady = (mapRefObject) => {
    mapRef.current = mapRefObject.current;
  };

  return (
    <div>
      <LocationSearch onLocationSelect={handleLocationSelect} />
      <ManualCoordinateInput onLocationSelect={handleLocationSelect} />
      <CountrySelector 
        onCountrySelect={onCoordinatesChange} 
        mapRef={mapRef} 
      />
      <InteractiveInstructions interactive={interactive} />
      <MapCore
        height={height}
        defaultZoom={defaultZoom}
        selectedCoordinates={selectedCoordinates}
        onCoordinatesChange={onCoordinatesChange}
        interactive={interactive}
        onMapReady={handleMapReady}
      />
    </div>
  );
};

export default OpenStreetMap;