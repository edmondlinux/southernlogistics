import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapCore = ({ 
  height, 
  defaultZoom, 
  selectedCoordinates, 
  onCoordinatesChange, 
  interactive,
  onMapReady 
}) => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const markerRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_TOKEN || 'pk.eyJ1IjoiZ25zbGVpZ2h0cyIsImEiOiJjbWV3cGFjeW0wbGE4MmlyMnV6ZGJ6ODN4In0.jIwl67v_ymjWSHEDxfnFZw';

    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: selectedCoordinates ? [selectedCoordinates.longitude, selectedCoordinates.latitude] : [0, 20],
      zoom: selectedCoordinates ? 10 : defaultZoom
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl());

    if (selectedCoordinates) {
      markerRef.current = new mapboxgl.Marker({ draggable: interactive })
        .setLngLat([selectedCoordinates.longitude, selectedCoordinates.latitude])
        .addTo(mapRef.current);

      if (interactive && onCoordinatesChange) {
        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current.getLngLat();
          // Create completely new plain object to avoid cloning issues
          const newCoords = {
            latitude: parseFloat(lngLat.lat.toFixed(6)),
            longitude: parseFloat(lngLat.lng.toFixed(6)),
          };
          onCoordinatesChange(newCoords);
        });
      }
    }

    if (interactive && onCoordinatesChange) {
      let clickTimeout = null;
      let lastTap = 0;

      mapRef.current.on('click', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }

        if (tapLength < 300 && tapLength > 0) {
          const currentZoom = mapRef.current.getZoom();
          mapRef.current.easeTo({
            zoom: currentZoom + 1,
            duration: 300
          });
          lastTap = 0;
          return;
        }

        clickTimeout = setTimeout(() => {
          const { lat, lng } = e.lngLat;

          if (markerRef.current) {
            markerRef.current.remove();
          }

          markerRef.current = new mapboxgl.Marker({ draggable: true })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);

          markerRef.current.on('dragend', () => {
            const lngLat = markerRef.current.getLngLat();
            // Create completely new plain object to avoid cloning issues
            const newCoords = {
              latitude: parseFloat(lngLat.lat.toFixed(6)),
              longitude: parseFloat(lngLat.lng.toFixed(6)),
            };
            onCoordinatesChange(newCoords);
          });

          // Create completely new plain object to avoid cloning issues
          const newCoords = {
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lng.toFixed(6)),
          };
          onCoordinatesChange(newCoords);

          clickTimeout = null;
        }, 250);

        lastTap = currentTime;
      });
    }

    if (onMapReady) {
      onMapReady(mapRef);
    }

    return () => {
      if (mapRef.current) {
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
        } catch (e) {}
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !selectedCoordinates) return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    markerRef.current = new mapboxgl.Marker({ draggable: interactive })
      .setLngLat([selectedCoordinates.longitude, selectedCoordinates.latitude])
      .addTo(mapRef.current);

    if (interactive && onCoordinatesChange) {
      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current.getLngLat();
        // Create completely new plain object to avoid cloning issues
        const newCoords = {
          latitude: parseFloat(lngLat.lat.toFixed(6)),
          longitude: parseFloat(lngLat.lng.toFixed(6)),
        };
        onCoordinatesChange(newCoords);
      });
    }
  }, [selectedCoordinates]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: height }}
      className="w-full rounded-lg border border-gray-600"
    />
  );
};

export default MapCore;