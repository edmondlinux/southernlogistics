
import { useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, X } from "lucide-react";

const MapLibreMap = ({
  height = "400px",
  defaultZoom = 2,
  selectedCoordinates,
  onCoordinatesChange,
  interactive = false,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Location selection state
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

  // Map style options
  const mapStyles = [
    {
      name: "Streets",
      url: "https://demotiles.maplibre.org/style.json"
    },
    {
      name: "Dark",
      url: "https://tiles.versatiles.org/assets/styles/colorful.json"
    }
  ];

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,latlng');
        const data = await response.json();

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

  // Fetch states when country changes
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

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `country=${encodeURIComponent(country.name)}&` +
          `featuretype=state&` +
          `format=json&` +
          `limit=20&` +
          `addressdetails=1`
        );

        let data = await response.json();

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

        const processedStates = data
          .filter(item => item.lat && item.lon && item.display_name)
          .map(item => ({
            name: item.display_name.split(',')[0].trim(),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            fullName: item.display_name
          }))
          .filter((state, index, array) => 
            array.findIndex(s => s.name === state.name) === index
          )
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 20);

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
        mapInstanceRef.current.flyTo({
          center: [country.lng, country.lat],
          zoom: 6
        });
        placeMarker(country.lng, country.lat, false);
      }
    }
  };

  // Handle state selection
  const handleStateChange = (stateIndex) => {
    setSelectedState(stateIndex);

    if (stateIndex !== "" && mapInstanceRef.current) {
      const state = states[parseInt(stateIndex)];
      if (state) {
        mapInstanceRef.current.flyTo({
          center: [state.lng, state.lat],
          zoom: 10
        });
        placeMarker(state.lng, state.lat, false);
      }
    }
  };

  // Place marker function
  const placeMarker = (lng, lat, updateCoordinates = true) => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create custom marker element
    const markerElement = document.createElement('div');
    markerElement.style.width = '32px';
    markerElement.style.height = '32px';
    markerElement.style.borderRadius = '50% 50% 50% 0';
    markerElement.style.background = '#10b981';
    markerElement.style.transform = 'rotate(-45deg)';
    markerElement.style.border = '3px solid #ffffff';
    markerElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    markerElement.style.cursor = interactive ? 'pointer' : 'default';

    // Add inner dot
    const innerDot = document.createElement('div');
    innerDot.style.width = '12px';
    innerDot.style.height = '12px';
    innerDot.style.background = '#ffffff';
    innerDot.style.borderRadius = '50%';
    innerDot.style.position = 'absolute';
    innerDot.style.top = '50%';
    innerDot.style.left = '50%';
    innerDot.style.transform = 'translate(-50%, -50%)';
    markerElement.appendChild(innerDot);

    // Create marker with MapLibre
    markerRef.current = new window.maplibregl.Marker({
      element: markerElement,
      draggable: interactive
    })
    .setLngLat([lng, lat])
    .addTo(mapInstanceRef.current);

    // Add popup
    const popup = new window.maplibregl.Popup({
      offset: 25
    }).setHTML(`
      <div style="padding: 8px;">
        <strong style="color: #10b981;">Shipment Location</strong><br/>
        <small>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}</small>
      </div>
    `);

    markerRef.current.setPopup(popup);

    // Handle drag events
    if (interactive && onCoordinatesChange) {
      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current.getLngLat();
        onCoordinatesChange({
          latitude: lngLat.lat,
          longitude: lngLat.lng,
        });
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
    const loadMapLibre = async () => {
      if (window.maplibregl) {
        initializeMap();
        return;
      }

      // Load MapLibre GL CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
      document.head.appendChild(link);

      // Load MapLibre GL JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js";
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const lat = selectedCoordinates ? selectedCoordinates.latitude : 20;
      const lng = selectedCoordinates ? selectedCoordinates.longitude : 0;
      const zoom = selectedCoordinates ? 12 : defaultZoom;

      const map = new window.maplibregl.Map({
        container: mapRef.current,
        style: mapStyles[0].url, // Default to streets style
        center: [lng, lat],
        zoom: zoom,
        attributionControl: true
      });

      // Add navigation controls
      map.addControl(new window.maplibregl.NavigationControl(), 'top-right');

      // Add click events for interactive mode
      if (interactive && onCoordinatesChange) {
        map.on('dblclick', (e) => {
          const { lng, lat } = e.lngLat;
          placeMarker(lng, lat);
        });
      }

      mapInstanceRef.current = map;

      // Place initial marker if coordinates exist
      if (selectedCoordinates) {
        placeMarker(selectedCoordinates.longitude, selectedCoordinates.latitude, false);
      }
    };

    loadMapLibre();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
  }, [defaultZoom, interactive]);

  // Handle coordinate changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCoordinates) return;

    placeMarker(selectedCoordinates.longitude, selectedCoordinates.latitude, false);
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
                className="w-full appearance-none bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
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
                className="w-full appearance-none bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
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
          <strong className="text-emerald-400">Interactive Mode:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Use dropdowns above for quick navigation</li>
            <li>• Double-click to place pin</li>
            <li>• Drag the pin to move it</li>
            <li>• Use mouse wheel or touch gestures to zoom</li>
          </ul>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{ height: height }}
        className="w-full rounded-lg border border-gray-600 bg-gray-800 shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-400" />
            <p>Loading beautiful map...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLibreMap;
