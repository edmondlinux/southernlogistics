
import React, { useState } from 'react';
import mapboxgl from 'mapbox-gl';

const LocationSearch = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearchResultSelect = (result) => {
    const [lng, lat] = result.center;
    setSearchQuery('');
    setSearchResults([]);
    onLocationSelect({ latitude: lat, longitude: lng });
  };

  return (
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
  );
};

export default LocationSearch;
