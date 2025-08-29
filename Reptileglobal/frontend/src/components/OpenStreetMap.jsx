
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
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,latlng,cca2,cca3');
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

    // Add click and double tap events for interactive mode
    if (interactive && onCoordinatesChange) {
      let clickTimeout = null;
      let lastTap = 0;

      mapRef.current.on('click', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        // Clear any existing timeout
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }

        // Check if this is a double tap (within 300ms)
        if (tapLength < 300 && tapLength > 0) {
          // Double tap - zoom in gradually
          const currentZoom = mapRef.current.getZoom();
          mapRef.current.easeTo({
            zoom: currentZoom + 1,
            duration: 300
          });
          lastTap = 0; // Reset to prevent triple tap
          return;
        }

        // Single tap - add marker after a short delay to distinguish from double tap
        clickTimeout = setTimeout(() => {
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
          
          clickTimeout = null;
        }, 250);

        lastTap = currentTime;
      });
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        // Clean up country highlight layers
        try {
          if (mapRef.current.getLayer('country-highlight-fill')) {
            mapRef.current.removeLayer('country-highlight-fill');
          }
          if (mapRef.current.getLayer('country-highlight-line')) {
            mapRef.current.removeLayer('country-highlight-line');
          }
          if (mapRef.current.getSource('country-highlight')) {
            mapRef.current.removeSource('country-highlight');
          }
        } catch (e) {
          // Ignore cleanup errors
        }
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

    // Only center map if this is the initial load with coordinates
    // Don't auto-zoom when marker is moved or new coordinates are set
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

        // Remove existing marker when selecting from dropdown (country view mode)
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        // Remove any existing country highlight layers
        if (mapRef.current.getLayer('country-highlight-fill')) {
          mapRef.current.removeLayer('country-highlight-fill');
        }
        if (mapRef.current.getLayer('country-highlight-line')) {
          mapRef.current.removeLayer('country-highlight-line');
        }
        if (mapRef.current.getSource('country-highlight')) {
          mapRef.current.removeSource('country-highlight');
        }

        // Get country ISO code for boundary lookup
        const countryISO = country.cca3 || country.cca2;
        
        // Fetch country boundary data from REST Countries API
        try {
          // First try to get detailed country info with borders
          const detailResponse = await fetch(`https://restcountries.com/v3.1/alpha/${countryISO.toLowerCase()}`);
          const detailData = await detailResponse.json();
          
          if (detailData && detailData.length > 0) {
            const countryDetail = detailData[0];
            
            // Use Natural Earth data for better country boundaries
            const boundaryResponse = await fetch(`https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson`);
            const boundaryData = await boundaryResponse.json();
            
            // Find the country in the GeoJSON data
            const countryFeature = boundaryData.features.find(feature => 
              feature.properties.NAME === countryName ||
              feature.properties.NAME_EN === countryName ||
              feature.properties.ISO_A2 === country.cca2 ||
              feature.properties.ISO_A3 === country.cca3
            );
            
            if (countryFeature) {
              // Create a GeoJSON source with just this country
              const countryGeoJSON = {
                type: 'FeatureCollection',
                features: [countryFeature]
              };
              
              // Add the source
              mapRef.current.addSource('country-highlight', {
                type: 'geojson',
                data: countryGeoJSON
              });
              
              // Add fill layer
              mapRef.current.addLayer({
                id: 'country-highlight-fill',
                type: 'fill',
                source: 'country-highlight',
                paint: {
                  'fill-color': '#22c55e',
                  'fill-opacity': 0.3
                }
              });
              
              // Add outline layer
              mapRef.current.addLayer({
                id: 'country-highlight-line',
                type: 'line',
                source: 'country-highlight',
                paint: {
                  'line-color': '#16a34a',
                  'line-width': 2
                }
              });
              
              // Fit the map to the country bounds
              const coordinates = countryFeature.geometry.coordinates;
              const bounds = new mapboxgl.LngLatBounds();
              
              const addCoordinatesToBounds = (coords) => {
                if (Array.isArray(coords[0])) {
                  coords.forEach(addCoordinatesToBounds);
                } else {
                  bounds.extend(coords);
                }
              };
              
              coordinates.forEach(addCoordinatesToBounds);
              
              mapRef.current.fitBounds(bounds, {
                padding: 50,
                duration: 2000
              });
            } else {
              // Fallback to center coordinates if boundary data not found
              mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 5,
                duration: 2000
              });
            }
          }
        } catch (boundaryError) {
          console.log('Using fallback country view without detailed boundaries');
          // Fallback to simple center view
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 5,
            duration: 2000
          });
        }

        // Clear coordinates when showing country boundaries (not a specific point)
        if (onCoordinatesChange) {
          onCoordinatesChange(null);
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
            <li>Single tap anywhere on the map to drop a pin for specific coordinates</li>
            <li>Double tap to zoom in gradually</li>
            <li>Hold and drag the pin to move its location</li>
            <li>Use the country selector above to highlight and view entire countries</li>
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
