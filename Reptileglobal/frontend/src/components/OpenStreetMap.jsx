import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const OpenStreetMap = ({
  height = "400px",
  defaultZoom = 2,
  selectedCoordinates,
  shipmentRoute = [], // Array of coordinates for the route
  currentLocation = null, // Current shipment location
  originLocation = null, // Origin location
  destinationLocation = null, // Destination location
}) => {
  // Sanitize coordinates to prevent cloning issues
  const sanitizeCoords = (coords) => {
    if (!coords || typeof coords !== 'object') return null;
    const lat = parseFloat(coords.latitude);
    const lng = parseFloat(coords.longitude);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { latitude: lat, longitude: lng };
  };

  const safeSelectedCoordinates = sanitizeCoords(selectedCoordinates);
  const safeCurrentLocation = sanitizeCoords(currentLocation);
  const safeOriginLocation = sanitizeCoords(originLocation);
  const safeDestinationLocation = sanitizeCoords(destinationLocation);
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const currentMarkerRef = useRef();
  const originMarkerRef = useRef();
  const destinationMarkerRef = useRef();

  useEffect(() => {
    // Set Mapbox access token from environment variable
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_TOKEN || 'pk.eyJ1IjoiZ25zbGVpZ2h0cyIsImEiOiJjbWV3cGFjeW0wbGE4MmlyMnV6ZGJ6ODN4In0.jIwl67v_ymjWSHEDxfnFZw';

    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with read-only settings
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: safeSelectedCoordinates ? [safeSelectedCoordinates.longitude, safeSelectedCoordinates.latitude] : [0, 20],
      zoom: safeSelectedCoordinates ? 10 : defaultZoom,
      // Make map read-only
      interactive: false,
      dragPan: false,
      dragRotate: false,
      scrollZoom: false,
      boxZoom: false,
      keyboard: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      touchPitch: false
    });

    // Add navigation controls (zoom only)
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup function
    return () => {
      if (mapRef.current) {
        // Clean up route layers and sources
        try {
          if (mapRef.current.getLayer('route-line')) {
            mapRef.current.removeLayer('route-line');
          }
          if (mapRef.current.getSource('route')) {
            mapRef.current.removeSource('route');
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
      // Clean up markers
      if (currentMarkerRef.current) {
        currentMarkerRef.current.remove();
        currentMarkerRef.current = null;
      }
      if (originMarkerRef.current) {
        originMarkerRef.current.remove();
        originMarkerRef.current = null;
      }
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
        destinationMarkerRef.current = null;
      }
    };
  }, []);

  // Update markers and route when data changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing markers
    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
      currentMarkerRef.current = null;
    }
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }

    // Add origin marker
    if (safeOriginLocation) {
      const originElement = document.createElement('div');
      originElement.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          background-color: #10b981;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
          font-weight: bold;
        ">O</div>
      `;

      originMarkerRef.current = new mapboxgl.Marker({ element: originElement })
        .setLngLat([safeOriginLocation.longitude, safeOriginLocation.latitude])
        .addTo(mapRef.current);

      // Add popup for origin
      const originPopup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 8px;">
            <strong>Origin</strong><br/>
            Lat: ${safeOriginLocation.latitude.toFixed(6)}<br/>
            Lng: ${safeOriginLocation.longitude.toFixed(6)}
          </div>
        `);

      originMarkerRef.current.setPopup(originPopup);
    }

    // Add destination marker
    if (safeDestinationLocation) {
      const destinationElement = document.createElement('div');
      destinationElement.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          background-color: #ef4444;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
          font-weight: bold;
        ">D</div>
      `;

      destinationMarkerRef.current = new mapboxgl.Marker({ element: destinationElement })
        .setLngLat([safeDestinationLocation.longitude, safeDestinationLocation.latitude])
        .addTo(mapRef.current);

      // Add popup for destination
      const destinationPopup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 8px;">
            <strong>Destination</strong><br/>
            Lat: ${safeDestinationLocation.latitude.toFixed(6)}<br/>
            Lng: ${safeDestinationLocation.longitude.toFixed(6)}
          </div>
        `);

      destinationMarkerRef.current.setPopup(destinationPopup);
    }

    // Add current location marker (highlighted)
    if (safeCurrentLocation || safeSelectedCoordinates) {
      const coords = safeCurrentLocation || safeSelectedCoordinates;

      const currentElement = document.createElement('div');
      currentElement.innerHTML = `
        <div style="position: relative;">
          <div style="
            width: 32px;
            height: 32px;
            background-color: #3b82f6;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            animation: pulse 2s infinite;
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 12px;
            height: 12px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% { box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 0 rgba(59, 130, 246, 0); }
          }
        </style>
      `;

      currentMarkerRef.current = new mapboxgl.Marker({ element: currentElement })
        .setLngLat([coords.longitude, coords.latitude])
        .addTo(mapRef.current);

      // Add popup for current location
      const currentPopup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 8px;">
            <strong>Current Location</strong><br/>
            Lat: ${coords.latitude.toFixed(6)}<br/>
            Lng: ${coords.longitude.toFixed(6)}
          </div>
        `);

      currentMarkerRef.current.setPopup(currentPopup);

      // Center map on current location
      mapRef.current.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: 12,
        duration: 1500
      });
    }

    // Add route line if route data is provided
    if (shipmentRoute && shipmentRoute.length > 1) {
      // Remove existing route
      if (mapRef.current.getSource('route')) {
        mapRef.current.removeLayer('route-line');
        mapRef.current.removeSource('route');
      }

      // Convert route coordinates to GeoJSON format
      const routeGeoJSON = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: shipmentRoute.map(coord => [coord.longitude, coord.latitude])
        }
      };

      // Add route source and layer
      mapRef.current.addSource('route', {
        type: 'geojson',
        data: routeGeoJSON
      });

      mapRef.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Fit map to show entire route
      const bounds = new mapboxgl.LngLatBounds();
      shipmentRoute.forEach(coord => {
        bounds.extend([coord.longitude, coord.latitude]);
      });

      mapRef.current.fitBounds(bounds, {
        padding: 50,
        duration: 1500
      });
    }

  }, [safeSelectedCoordinates, shipmentRoute, safeCurrentLocation, safeOriginLocation, safeDestinationLocation]);

  return (
    <div>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height: height }}
        className="w-full rounded-lg border border-gray-600 bg-gray-700"
      >
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50">📍</div>
            <p>Loading map...</p>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="mt-3 p-3 bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Map Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
            <span>Current Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full border border-white"></div>
            <span>Origin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
            <span>Destination</span>
          </div>
        </div>
        {shipmentRoute && shipmentRoute.length > 1 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <div className="w-4 h-0.5 bg-blue-500"></div>
            <span>Transit Route</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenStreetMap;