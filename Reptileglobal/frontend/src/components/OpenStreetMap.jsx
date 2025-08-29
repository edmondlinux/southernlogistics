
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const OpenStreetMap = ({
  height = "400px",
  defaultZoom = 2,
  selectedCoordinates,
  onCoordinatesChange,
  interactive = false,
}) => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const markerRef = useRef();

  useEffect(() => {
    // Set Mapbox access token from environment variable
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_TOKEN || 'pk.eyJ1IjoiZ25zbGVpZ2h0cyIsImEiOiJjbWV3cGFjeW0wbGE4MmlyMnV6ZGJ6ODN4In0.jIwl67v_ymjWSHEDxfnFZw';

    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with default settings
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: selectedCoordinates ? [selectedCoordinates.longitude, selectedCoordinates.latitude] : [0, 20],
      zoom: selectedCoordinates ? 10 : defaultZoom
    });

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl());

    // Add marker if coordinates are provided
    if (selectedCoordinates) {
      markerRef.current = new mapboxgl.Marker()
        .setLngLat([selectedCoordinates.longitude, selectedCoordinates.latitude])
        .addTo(mapRef.current);
    }

    // Add click event for interactive mode
    if (interactive && onCoordinatesChange) {
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.lngLat;
        
        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Add new marker
        markerRef.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        // Update coordinates
        onCoordinatesChange({
          latitude: lat,
          longitude: lng,
        });
      });
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, []);

  // Handle coordinate changes from props
  useEffect(() => {
    if (!mapRef.current || !selectedCoordinates) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new marker
    markerRef.current = new mapboxgl.Marker()
      .setLngLat([selectedCoordinates.longitude, selectedCoordinates.latitude])
      .addTo(mapRef.current);

    // Center map on new coordinates
    mapRef.current.flyTo({
      center: [selectedCoordinates.longitude, selectedCoordinates.latitude],
      zoom: 10
    });
  }, [selectedCoordinates]);

  return (
    <div>
      {interactive && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
          <strong>Interactive Mode:</strong> Click anywhere on the map to drop a pin
        </div>
      )}
      <div
        ref={mapContainerRef}
        style={{ height: height }}
        className="w-full rounded-lg border border-gray-600"
      />
    </div>
  );
};

export default OpenStreetMap;
