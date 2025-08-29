
import React, { useEffect, useRef, useState } from 'react';
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
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,latlng');
        const data = await response.json();
        const sortedCountries = data
          .filter(country => country.latlng && country.latlng.length === 2)
          .sort((a, b) => a.name.common.localeCompare(b.name.common)); // Sort alphabetically
        setCountries(sortedCountries);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    };
    fetchCountries();
  }, []);

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
      markerRef.current = new mapboxgl.Marker({ draggable: interactive })
        .setLngLat([selectedCoordinates.longitude, selectedCoordinates.latitude])
        .addTo(mapRef.current);

      // Add drag event listener for interactive mode
      if (interactive && onCoordinatesChange) {
        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current.getLngLat();
          onCoordinatesChange({
            latitude: lngLat.lat,
            longitude: lngLat.lng,
          });
        });
      }
    }

    // Add click event for interactive mode
    if (interactive && onCoordinatesChange) {
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.lngLat;
        
        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Add new draggable marker
        markerRef.current = new mapboxgl.Marker({ draggable: true })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        // Add drag event listener
        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current.getLngLat();
          onCoordinatesChange({
            latitude: lngLat.lat,
            longitude: lngLat.lng,
          });
        });

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

    // Add new draggable marker
    markerRef.current = new mapboxgl.Marker({ draggable: interactive })
      .setLngLat([selectedCoordinates.longitude, selectedCoordinates.latitude])
      .addTo(mapRef.current);

    // Add drag event listener for interactive mode
    if (interactive && onCoordinatesChange) {
      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current.getLngLat();
        onCoordinatesChange({
          latitude: lngLat.lat,
          longitude: lngLat.lng,
        });
      });
    }

    // Center map on new coordinates
    mapRef.current.flyTo({
      center: [selectedCoordinates.longitude, selectedCoordinates.latitude],
      zoom: 10
    });
  }, [selectedCoordinates]);

  // Handle country selection
  const handleCountrySelect = async (countryName) => {
    if (!countryName || !mapRef.current) return;
    
    setLoading(true);
    setSelectedCountry(countryName);

    try {
      const country = countries.find(c => c.name.common === countryName);
      if (country && country.latlng) {
        const [lat, lng] = country.latlng;

        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Add new marker at country location
        markerRef.current = new mapboxgl.Marker({ draggable: interactive })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        // Add drag event listener for interactive mode
        if (interactive && onCoordinatesChange) {
          markerRef.current.on('dragend', () => {
            const lngLat = markerRef.current.getLngLat();
            onCoordinatesChange({
              latitude: lngLat.lat,
              longitude: lngLat.lng,
            });
          });
        }

        // Fly to country location
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 6,
          duration: 2000
        });

        // Update coordinates if callback provided
        if (onCoordinatesChange) {
          onCoordinatesChange({
            latitude: lat,
            longitude: lng,
          });
        }
      }
    } catch (error) {
      console.error('Failed to navigate to country:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Country Selector */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Navigate to Country
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => handleCountrySelect(e.target.value)}
          disabled={loading}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          <option value="">Select a country...</option>
          {countries.map((country) => (
            <option key={country.name.common} value={country.name.common}>
              {country.name.common}
            </option>
          ))}
        </select>
        {loading && (
          <div className="mt-2 text-sm text-emerald-400">
            Navigating to {selectedCountry}...
          </div>
        )}
      </div>

      {/* Interactive Instructions */}
      {interactive && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
          <strong>Interactive Mode:</strong> 
          <ul className="mt-1 ml-4 list-disc">
            <li>Click anywhere on the map to drop a pin</li>
            <li>Hold and drag the pin to move its location</li>
            <li>Use the country selector above to navigate to specific countries</li>
          </ul>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height: height }}
        className="w-full rounded-lg border border-gray-600"
      />
    </div>
  );
};

export default OpenStreetMap;
