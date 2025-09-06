import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const OpenStreetMap = ({
  height = "400px",
  defaultZoom = 2,
  selectedCoordinates,
  onCoordinatesChange,
  interactive = false,
  shipmentRoute = [], // Array of coordinates for the route
  currentLocation = null, // Current shipment location
  originLocation = null, // Origin location
  destinationLocation = null, // Destination location
}) => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const markerRef = useRef();
  const currentMarkerRef = useRef();
  const originMarkerRef = useRef();
  const destinationMarkerRef = useRef();
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

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

    // Initialize map with default settings or read-only for shipment display
    const mapSettings = {
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: selectedCoordinates ? [selectedCoordinates.longitude, selectedCoordinates.latitude] : [0, 20],
      zoom: selectedCoordinates ? 10 : defaultZoom
    };

    // If displaying shipment route, make map read-only
    if (shipmentRoute.length > 0 || currentLocation || originLocation || destinationLocation) {
      mapSettings.interactive = false;
      mapSettings.dragPan = false;
      mapSettings.dragRotate = false;
      mapSettings.scrollZoom = false;
      mapSettings.boxZoom = false;
      mapSettings.keyboard = false;
      mapSettings.doubleClickZoom = false;
      mapSettings.touchZoomRotate = false;
      mapSettings.touchPitch = false;
    }

    mapRef.current = new mapboxgl.Map(mapSettings);

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker if coordinates are provided and not in shipment display mode
    if (selectedCoordinates && !shipmentRoute.length && !currentLocation && !originLocation && !destinationLocation) {
      markerRef.current = new mapboxgl.Marker({ draggable: interactive })
        .setLngLat([selectedCoordinates.longitude, selectedCoordinates.latitude])
        .addTo(mapRef.current);

      // Add drag event listener for interactive mode
      if (interactive && onCoordinatesChange) {
        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current.getLngLat();
          onCoordinatesChange({
            latitude: parseFloat(lngLat.lat.toFixed(6)),
            longitude: parseFloat(lngLat.lng.toFixed(6)),
          });
        });
      }
    }

    // Add click and double tap events for interactive mode (only if not in shipment display mode)
    if (interactive && onCoordinatesChange && !shipmentRoute.length && !currentLocation && !originLocation && !destinationLocation) {
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
              latitude: parseFloat(lngLat.lat.toFixed(6)),
              longitude: parseFloat(lngLat.lng.toFixed(6)),
            });
          });

          // Update coordinates
          onCoordinatesChange({
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lng.toFixed(6)),
          });

          clickTimeout = null;
        }, 250);

        lastTap = currentTime;
      });
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        // Clean up country highlight layers and route layers
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
      // Clean up all markers
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
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

  // Handle coordinate changes from props and shipment route display
  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing markers
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
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

    // If we're displaying a shipment route, show route markers
    if (shipmentRoute.length > 0 || currentLocation || originLocation || destinationLocation) {

      // Add origin marker
      if (originLocation) {
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
          .setLngLat([originLocation.longitude, originLocation.latitude])
          .addTo(mapRef.current);

        // Add popup for origin
        const originPopup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <strong>Origin</strong><br/>
              Lat: ${originLocation.latitude.toFixed(6)}<br/>
              Lng: ${originLocation.longitude.toFixed(6)}
            </div>
          `);

        originMarkerRef.current.setPopup(originPopup);
      }

      // Add destination marker
      if (destinationLocation) {
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
          .setLngLat([destinationLocation.longitude, destinationLocation.latitude])
          .addTo(mapRef.current);

        // Add popup for destination
        const destinationPopup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <strong>Destination</strong><br/>
              Lat: ${destinationLocation.latitude.toFixed(6)}<br/>
              Lng: ${destinationLocation.longitude.toFixed(6)}
            </div>
          `);

        destinationMarkerRef.current.setPopup(destinationPopup);
      }

      // Add current location marker (highlighted)
      if (currentLocation || selectedCoordinates) {
        const coords = currentLocation || selectedCoordinates;

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

    } else if (selectedCoordinates && !shipmentRoute.length && !currentLocation && !originLocation && !destinationLocation) {
      // Regular coordinate marker for admin form
      markerRef.current = new mapboxgl.Marker({ draggable: interactive })
        .setLngLat([selectedCoordinates.longitude, selectedCoordinates.latitude])
        .addTo(mapRef.current);

      // Add drag event listener for interactive mode
      if (interactive && onCoordinatesChange) {
        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current.getLngLat();
          onCoordinatesChange({
            latitude: parseFloat(lngLat.lat.toFixed(6)),
            longitude: parseFloat(lngLat.lng.toFixed(6)),
          });
        });
      }
    }

  }, [selectedCoordinates, shipmentRoute, currentLocation, originLocation, destinationLocation]);

  // Handle location search using Mapbox Geocoding API
  const handleLocationSearch = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&types=place,locality,neighborhood,address,poi&limit=5`
      );
      const data = await response.json();

      if (data.features) {
        setSearchResults(data.features.map(feature => ({
          id: feature.id,
          place_name: feature.place_name,
          center: feature.center,
          place_type: feature.place_type[0]
        })));
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    const [lng, lat] = result.center;

    // Clear search
    setSearchQuery('');
    setSearchResults([]);

    // Update coordinates
    if (onCoordinatesChange) {
      onCoordinatesChange({
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6)),
      });
    }

    // Center map and add marker
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1500
      });
    }
  };

  // Handle manual coordinate input
  const handleManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
      return;
    }

    // Update coordinates
    if (onCoordinatesChange) {
      onCoordinatesChange({
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6)),
      });
    }

    // Center map
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1500
      });
    }

    // Clear inputs
    setManualLat('');
    setManualLng('');
  };

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

  // Don't show search/country controls if we're in shipment display mode
  const isShipmentDisplayMode = shipmentRoute.length > 0 || currentLocation || originLocation || destinationLocation;

  return (
    <div>
      {/* Location Search - only show in interactive admin mode */}
      {!isShipmentDisplayMode && (
        <>
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleLocationSearch(e.target.value);
                }}
                placeholder="Search for addresses, places, or landmarks..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-2">
                  <div className="animate-spin h-5 w-5 border-2 border-emerald-400 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-gray-700 rounded-lg border border-gray-600 max-h-48 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSearchResultSelect(result)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white text-sm border-b border-gray-600 last:border-b-0 focus:outline-none focus:bg-gray-600"
                  >
                    <div className="font-medium">{result.place_name}</div>
                    <div className="text-xs text-gray-400 capitalize">{result.place_type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manual Coordinate Input */}
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
                <li>Search for any location using the search box above</li>
                <li>Enter coordinates manually for precise positioning</li>
                <li>Single tap anywhere on the map to drop a pin</li>
                <li>Double tap to zoom in gradually</li>
                <li>Hold and drag the pin to move its location</li>
                <li>Use the country selector to highlight entire countries</li>
              </ul>
            </div>
          )}
        </>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height: height }}
        className="w-full rounded-lg border border-gray-600"
      />

      {/* Map Legend - only show in shipment display mode */}
      {isShipmentDisplayMode && (
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
      )}
    </div>
  );
};

export default OpenStreetMap;