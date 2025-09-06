
import React, { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const CountrySelector = ({ onCountrySelect, mapRef }) => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,latlng,cca2,cca3');
        const data = await response.json();
        const sortedCountries = data
          .filter(country => country.latlng && country.latlng.length === 2)
          .sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sortedCountries);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    };
    fetchCountries();
  }, []);

  const handleCountrySelect = async (countryName) => {
    if (!countryName || !mapRef.current) return;
    
    setLoading(true);
    setSelectedCountry(countryName);

    try {
      const country = countries.find(c => c.name.common === countryName);
      if (country && country.latlng) {
        const [lat, lng] = country.latlng;

        // Remove existing country highlight layers
        if (mapRef.current.getLayer('country-highlight-fill')) {
          mapRef.current.removeLayer('country-highlight-fill');
        }
        if (mapRef.current.getLayer('country-highlight-line')) {
          mapRef.current.removeLayer('country-highlight-line');
        }
        if (mapRef.current.getSource('country-highlight')) {
          mapRef.current.removeSource('country-highlight');
        }

        const countryISO = country.cca3 || country.cca2;
        
        try {
          const detailResponse = await fetch(`https://restcountries.com/v3.1/alpha/${countryISO.toLowerCase()}`);
          const detailData = await detailResponse.json();
          
          if (detailData && detailData.length > 0) {
            const boundaryResponse = await fetch(`https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson`);
            const boundaryData = await boundaryResponse.json();
            
            const countryFeature = boundaryData.features.find(feature => 
              feature.properties.NAME === countryName ||
              feature.properties.NAME_EN === countryName ||
              feature.properties.ISO_A2 === country.cca2 ||
              feature.properties.ISO_A3 === country.cca3
            );
            
            if (countryFeature) {
              const countryGeoJSON = {
                type: 'FeatureCollection',
                features: [countryFeature]
              };
              
              mapRef.current.addSource('country-highlight', {
                type: 'geojson',
                data: countryGeoJSON
              });
              
              mapRef.current.addLayer({
                id: 'country-highlight-fill',
                type: 'fill',
                source: 'country-highlight',
                paint: {
                  'fill-color': '#22c55e',
                  'fill-opacity': 0.3
                }
              });
              
              mapRef.current.addLayer({
                id: 'country-highlight-line',
                type: 'line',
                source: 'country-highlight',
                paint: {
                  'line-color': '#16a34a',
                  'line-width': 2
                }
              });
              
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
              mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 5,
                duration: 2000
              });
            }
          }
        } catch (boundaryError) {
          console.log('Using fallback country view without detailed boundaries');
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 5,
            duration: 2000
          });
        }

        onCountrySelect(null);
      }
    } catch (error) {
      console.error('Failed to navigate to country:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default CountrySelector;
