import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function LocallieMap({ issues, center = [12.9716, 77.5946], radius = 5000, onSelectIssue }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const circleRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map Instance
    const map = L.map(mapContainerRef.current).setView(center, 13);
    mapInstanceRef.current = map;

    // Load OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create marker group Layer
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Add marker icons fix
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center, markers, and search radius circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Center map
    map.setView(center);

    // Clear previous markers
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    // Clear previous radius circle
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    // Draw radius boundary circle
    if (radius > 0) {
      circleRef.current = L.circle(center, {
        color: '#71717a',      // zinc-500
        fillColor: '#a1a1aa',  // zinc-400
        fillOpacity: 0.08,
        radius: radius
      }).addTo(map);
    }

    // Plot pins
    issues.forEach(issue => {
      if (!issue.gps || !issue.gps.lat || !issue.gps.lng) return;

      // Select monochrome color styling based on status
      let bg = '#000000';
      let border = '#ffffff';
      let dot = '#ffffff';
      let isPulse = true;

      if (issue.status === 'resolved') {
        bg = '#ffffff';
        border = '#000000';
        dot = '#000000';
        isPulse = false;
      } else if (issue.status === 'claimed') {
        bg = '#a1a1aa'; // zinc-400
        border = '#000000';
        dot = '#ffffff';
        isPulse = false;
      }

      // Create a gorgeous custom HTML marker
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center w-7 h-7 rounded-full shadow-md transition-all transform hover:scale-110" style="background-color: ${bg}; border: 2px solid ${border}">
            <span class="w-2 h-2 rounded-full ${isPulse ? 'animate-pulse' : ''}" style="background-color: ${dot}"></span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -8]
      });

      const marker = L.marker([issue.gps.lat, issue.gps.lng], { icon: customIcon })
        .addTo(markersGroupRef.current);

      // Bind dynamic popup card
      const popupContent = `
        <div class="p-3 max-w-[240px] text-zinc-900 font-sans">
          <div class="relative h-20 bg-zinc-100 rounded overflow-hidden mb-2">
            <img src="${issue.image}" class="w-full h-full object-cover" />
            <span class="absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-black text-white">${issue.status.toUpperCase()}</span>
          </div>
          <h4 class="font-bold text-xs line-clamp-1 mb-1">${issue.title}</h4>
          <p class="text-[10px] text-zinc-500 mb-2">${issue.category} • Severity: <b>${issue.severity}</b></p>
          <button id="btn-popup-${issue.id}" class="w-full py-1 text-center bg-black hover:bg-zinc-900 text-white text-[10px] font-bold rounded transition-all cursor-pointer">
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Event listener for view details within map popups
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${issue.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            if (onSelectIssue) onSelectIssue(issue);
          });
        }
      });
    });
  }, [issues, center, radius, onSelectIssue]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]"></div>
    </div>
  );
}
