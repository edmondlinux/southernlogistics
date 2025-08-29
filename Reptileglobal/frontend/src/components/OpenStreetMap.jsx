
import { useEffect, useRef, useState } from "react";
import { MapPin, X, ChevronDown } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const OpenStreetMap = ({
  height = "400px",
  defaultZoom = 2,
  selectedCoordinates,
  onCoordinatesChange,
  interactive = false,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // New state for location selection
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,latlng');
        const data = await response.json();

        // Sort countries alphabetically and filter out those without coordinates
        const sortedCountries = data
          .filter(country => country.latlng && country.latlng.length >= 2)
          .sort((a, b) => a.name.common.localeCompare(b.name.common))
          .map(country => ({
            name: country.name.common,
            code: country.cca2,
            lat: country.latlng[0],
            lng: country.latlng[1]
          }));

        setCountries(sortedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch states/provinces when country changes
  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      setSelectedState("");
      return;
    }

    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const country = countries.find(c => c.code === selectedCountry);
        if (!country) return;

        // Use Nominatim to search for administrative divisions (states/provinces)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `country=${encodeURIComponent(country.name)}&` +
          `featuretype=state&` +
          `format=json&` +
          `limit=20&` +
          `addressdetails=1`
        );

        let data = await response.json();

        // If no states found, try searching for major cities instead
        if (data.length === 0) {
          const cityResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `country=${encodeURIComponent(country.name)}&` +
            `featuretype=city&` +
            `format=json&` +
            `limit=15&` +
            `addressdetails=1`
          );
          data = await cityResponse.json();
        }

        // Process and deduplicate results
        const processedStates = data
          .filter(item => item.lat && item.lon && item.display_name)
          .map(item => ({
            name: item.display_name.split(',')[0].trim(),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            fullName: item.display_name
          }))
          .filter((state, index, array) => 
            // Remove duplicates based on name
            array.findIndex(s => s.name === state.name) === index
          )
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 20); // Limit to 20 results

        setStates(processedStates);
      } catch (error) {
        console.error('Error fetching states:', error);
        setStates([]);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, [selectedCountry, countries]);

  // Handle country selection
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setSelectedState("");

    if (countryCode && mapInstanceRef.current) {
      const country = countries.find(c => c.code === countryCode);
      if (country) {
        // Move map to country and place marker
        mapInstanceRef.current.flyTo({
          center: [country.lng, country.lat],
          zoom: 6
        });
        placeMarker(country.lat, country.lng, false);
      }
    }
  };

  // Handle state selection
  const handleStateChange = (stateIndex) => {
    setSelectedState(stateIndex);

    if (stateIndex !== "" && mapInstanceRef.current) {
      const state = states[parseInt(stateIndex)];
      if (state) {
        // Move map to state/city and place marker
        mapInstanceRef.current.flyTo({
          center: [state.lng, state.lat],
          zoom: 10
        });
        placeMarker(state.lat, state.lng, false);
      }
    }
  };

  // Function to place marker
  const placeMarker = (lat, lng, updateCoordinates = true) => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create custom marker element
    const markerElement = document.createElement('div');
    markerElement.innerHTML = `
      <div style="position: relative;">
        <div style="
          width: 0; 
          height: 0; 
          border-left: 12px solid transparent; 
          border-right: 12px solid transparent; 
          border-top: 20px solid #10b981;
          position: relative;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        "></div>
        <div style="
          width: 16px; 
          height: 16px; 
          background-color: #10b981; 
          border-radius: 50%; 
          border: 2px solid white;
          position: absolute;
          top: -18px;
          left: -8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        "></div>
      </div>
    `;

    // Add new marker
    markerRef.current = new mapboxgl.Marker({
      element: markerElement,
      draggable: interactive
    })
      .setLngLat([lng, lat])
      .addTo(mapInstanceRef.current);

    // Add popup
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<strong>Selected Location</strong><br/>
                Latitude: ${lat.toFixed(6)}<br/>
                Longitude: ${lng.toFixed(6)}`);
    
    markerRef.current.setPopup(popup);

    // Add drag event listeners for interactive mode
    if (interactive && onCoordinatesChange) {
      markerRef.current.on('dragend', (e) => {
        const lngLat = e.target.getLngLat();
        onCoordinatesChange({
          latitude: lngLat.lat,
          longitude: lngLat.lng,
        });
        
        // Update popup content
        const newPopup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<strong>Selected Location</strong><br/>
                    Latitude: ${lngLat.lat.toFixed(6)}<br/>
                    Longitude: ${lngLat.lng.toFixed(6)}`);
        markerRef.current.setPopup(newPopup);
      });
    }

    // Update coordinates
    if (updateCoordinates && onCoordinatesChange) {
      onCoordinatesChange({
        latitude: lat,
        longitude: lng,
      });
    }
  };

  // Initialize map
  useEffect(() => {
    // Set Mapbox access token from environment variable
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_TOKEN || 'pk.eyJ1IjoiZ25zbGVpZ2h0cyIsImEiOiJjbWV3cGFjeW0wbGE4MmlyMnV6ZGJ6ODN4In0.jIwl67v_ymjWSHEDxfnFZw';

    if (!mapRef.current || mapInstanceRef.current) return;

    // Use coordinates if provided, otherwise default to world view
    const lat = selectedCoordinates ? selectedCoordinates.latitude : 20;
    const lng = selectedCoordinates ? selectedCoordinates.longitude : 0;
    const zoom = selectedCoordinates ? 12 : defaultZoom;

    // Initialize the map
    mapInstanceRef.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v12', // You can change this to other styles
      center: [lng, lat],
      zoom: zoom,
      dragPan: true,
      scrollZoom: true,
      doubleClickZoom: false,
      touchZoomRotate: true,
      keyboard: interactive,
    });

    // Add navigation controls
    mapInstanceRef.current.addControl(new mapboxgl.NavigationControl());

    // Add click/touch event listeners for interactive mode
    if (interactive && onCoordinatesChange) {
      // For desktop - double click
      mapInstanceRef.current.on('dblclick', (e) => {
        const { lat, lng } = e.lngLat;
        placeMarker(lat, lng);
      });

      // For mobile - long press (hold)
      let pressTimer = null;
      let startPos = null;
      let hasMoved = false;

      mapInstanceRef.current.on('mousedown touchstart', (e) => {
        const originalEvent = e.originalEvent;
        startPos = { x: e.point.x, y: e.point.y };
        hasMoved = false;

        // Handle touch events (only single touch)
        if (originalEvent.touches && originalEvent.touches.length === 1) {
          pressTimer = setTimeout(() => {
            if (!hasMoved) {
              const { lat, lng } = e.lngLat;
              placeMarker(lat, lng);
            }
          }, 700);
        }
        // Handle mouse events (excluding right clicks)
        else if (!originalEvent.touches && originalEvent.button === 0) {
          pressTimer = setTimeout(() => {
            if (!hasMoved) {
              const { lat, lng } = e.lngLat;
              placeMarker(lat, lng);
            }
          }, 700);
        }
      });

      mapInstanceRef.current.on('mousemove touchmove', (e) => {
        if (startPos) {
          const currentPos = { x: e.point.x, y: e.point.y };
          const distance = Math.sqrt(
            Math.pow(currentPos.x - startPos.x, 2) + 
            Math.pow(currentPos.y - startPos.y, 2)
          );

          if (distance > 10) {
            hasMoved = true;
            if (pressTimer) {
              clearTimeout(pressTimer);
              pressTimer = null;
            }
          }
        }
      });

      mapInstanceRef.current.on('mouseup touchend', () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
        startPos = null;
        hasMoved = false;
      });

      // Prevent context menu on long press
      mapInstanceRef.current.on('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [defaultZoom, interactive]);

  // Handle coordinate changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCoordinates) return;

    // Place marker at new coordinates
    placeMarker(selectedCoordinates.latitude, selectedCoordinates.longitude, false);
  }, [selectedCoordinates, interactive, onCoordinatesChange]);

  return (
    <div className="space-y-4">
      {/* Location Selection Dropdowns */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Select Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Country Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Country
            </label>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                disabled={loadingCountries}
                className="w-full appearance-none bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">
                  {loadingCountries ? "Loading countries..." : "Select a country"}
                </option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* State/Province Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              State/Province/City
            </label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                disabled={!selectedCountry || loadingStates || states.length === 0}
                className="w-full appearance-none bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">
                  {!selectedCountry ? "Select a country first" :
                   loadingStates ? "Loading locations..." :
                   states.length === 0 ? "No locations found" :
                   "Select a location"}
                </option>
                {states.map((state, index) => (
                  <option key={index} value={index}>
                    {state.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Clear Selection Button */}
        {(selectedCountry || selectedState) && (
          <div className="mt-3">
            <button
              onClick={() => {
                setSelectedCountry("");
                setSelectedState("");
                if (mapInstanceRef.current && markerRef.current) {
                  markerRef.current.remove();
                  markerRef.current = null;
                  mapInstanceRef.current.flyTo({
                    center: [0, 20],
                    zoom: defaultZoom
                  });
                }
              }}
              className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Interactive Mode Instructions */}
      {interactive && (
        <div className="text-sm text-gray-400 bg-gray-800 p-3 rounded-lg">
          <strong>Interactive Mode:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Use the dropdowns above to quickly navigate to a location</li>
            <li>• Desktop: Double-click to place pin</li>
            <li>• Mobile: Press and hold to place pin</li>
            <li>• Click and drag the pin to move it</li>
            <li>• Use mouse wheel or pinch to zoom in/out</li>
          </ul>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{ height: height }}
        className="w-full rounded-lg border border-gray-600 bg-gray-700"
      >
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Loading map...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenStreetMap;
