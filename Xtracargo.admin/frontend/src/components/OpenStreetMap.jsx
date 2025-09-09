
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, X, ChevronDown } from 'lucide-react';

const OpenStreetMap = ({
  height = "400px",
  selectedCoordinates,
  onCoordinatesChange,
  interactive = false,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [mapProvider, setMapProvider] = useState('osm');
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);

  // Load Leaflet scripts and styles
  useEffect(() => {
    if (window.L) {
      setIsScriptLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current || mapInstanceRef.current) return;

    const defaultLat = selectedCoordinates?.latitude || 0;
    const defaultLng = selectedCoordinates?.longitude || 0;

    mapInstanceRef.current = window.L.map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: selectedCoordinates ? 13 : 2,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
    });

    updateTileLayer();

    if (selectedCoordinates) {
      addMarker(selectedCoordinates.latitude, selectedCoordinates.longitude);
    }

    if (interactive && onCoordinatesChange) {
      mapInstanceRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const newCoordinates = {
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6)),
        };
        onCoordinatesChange(newCoordinates);
        addMarker(lat, lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isScriptLoaded]);

  // Update coordinates when prop changes
  useEffect(() => {
    if (selectedCoordinates && mapInstanceRef.current) {
      const { latitude, longitude } = selectedCoordinates;
      mapInstanceRef.current.setView([latitude, longitude], 13);
      addMarker(latitude, longitude);
    }
  }, [selectedCoordinates]);

  const updateTileLayer = () => {
    if (!mapInstanceRef.current) return;

    // Remove existing tile layers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof window.L.TileLayer) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    const providers = {
      osm: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors'
      },
      satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri'
      },
      terrain: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenTopoMap contributors'
      }
    };

    const provider = providers[mapProvider];
    window.L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  };

  useEffect(() => {
    updateTileLayer();
  }, [mapProvider]);

  const addMarker = (lat, lng) => {
    if (!mapInstanceRef.current) return;

    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    markerRef.current = window.L.marker([lat, lng], {
      draggable: interactive,
    }).addTo(mapInstanceRef.current);

    if (interactive && onCoordinatesChange) {
      markerRef.current.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        const newCoordinates = {
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6)),
        };
        onCoordinatesChange(newCoordinates);
      });
    }
  };

  const mapProviders = [
    { id: 'osm', name: 'OpenStreetMap', description: 'Standard map view' },
    { id: 'satellite', name: 'Satellite', description: 'Satellite imagery' },
    { id: 'terrain', name: 'Terrain', description: 'Topographic map' },
  ];

  if (!isScriptLoaded) {
    return (
      <div className="flex items-center justify-center bg-gray-700 rounded-lg" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-2"></div>
          <p className="text-gray-300">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Provider Selector */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
            className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <span>{mapProviders.find(p => p.id === mapProvider)?.name}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isProviderDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProviderDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-10 min-w-[200px]">
              {mapProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => {
                    setMapProvider(provider.id);
                    setIsProviderDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    mapProvider === provider.id ? 'bg-gray-600 text-emerald-400' : 'text-white'
                  }`}
                >
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-sm text-gray-400">{provider.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {interactive && (
          <div className="text-sm text-gray-400">
            Click on the map to set location
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        <div
          ref={mapRef}
          style={{ height, width: '100%' }}
          className="rounded-lg"
        />
      </div>

      {/* Coordinates Display */}
      {selectedCoordinates && (
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-300">
              Latitude: <span className="text-white font-mono">{selectedCoordinates.latitude}</span>
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-300">
              Longitude: <span className="text-white font-mono">{selectedCoordinates.longitude}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenStreetMap;
