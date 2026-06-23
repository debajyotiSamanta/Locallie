import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function GpsPicker({ value, onChange, center = [12.9716, 77.5946] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create Map
    const map = L.map(mapRef.current).setView(center, 14);
    mapInstanceRef.current = map;

    // Add Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initial Marker
    const initialPos = value || { lat: center[0], lng: center[1] };
    const marker = L.marker([initialPos.lat, initialPos.lng], { draggable: true })
      .addTo(map);
    markerRef.current = marker;

    // Drag marker event
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      if (onChange) {
        onChange({ lat: position.lat, lng: position.lng });
      }
    });

    // Map click event to relocate marker
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      if (onChange) {
        onChange({ lat, lng });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position if coordinates change externally
  useEffect(() => {
    if (markerRef.current && value) {
      markerRef.current.setLatLng([value.lat, value.lng]);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([value.lat, value.lng]);
      }
    }
  }, [value]);

  return (
    <div className="w-full h-44 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <div ref={mapRef} className="w-full h-full min-h-[176px]"></div>
      <div className="absolute bottom-2 left-2 z-[9] bg-black/70 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
        Click map or drag marker to set coordinates
      </div>
    </div>
  );
}
