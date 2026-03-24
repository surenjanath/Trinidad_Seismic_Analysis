import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup, Circle, useMap, Polyline } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { SeismicEvent } from '../src/services/SeismicService';
import L from 'leaflet';

interface SeismicMapProps {
  events: SeismicEvent[];
  onEventSelect: (event: SeismicEvent) => void;
  selectedEvent?: SeismicEvent | null;
}

// Component to handle map bounds updates
const MapBounds: React.FC<{ events: SeismicEvent[] }> = ({ events }) => {
    const map = useMap();
    
    useEffect(() => {
        if (events.length > 0) {
            const bounds = L.latLngBounds(events.map(e => [e.lat, e.lon]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }
    }, [events, map]);
    
    return null;
};

const SeismicMap: React.FC<SeismicMapProps> = ({ events, onEventSelect, selectedEvent }) => {
  const [activeEvent, setActiveEvent] = useState<SeismicEvent | null>(null);
  const [plates, setPlates] = useState<any>(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
      .then(async res => {
        if (!res.ok) throw new Error('Network response was not ok');
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error("Invalid JSON response from plates API");
        }
      })
      .then(data => setPlates(data))
      .catch(err => console.error("Failed to fetch plates data:", err));
  }, []);

  // Define color scale for magnitude
  const getColor = (magnitude: number) => {
    return magnitude >= 7 ? '#ef4444' : // Red
           magnitude >= 5 ? '#f97316' : // Orange
           magnitude >= 3 ? '#fbbf24' : // Amber
                            '#22c55e';  // Green
  };

  const getRadius = (magnitude: number) => {
    return Math.max(3, magnitude * 2);
  };

  // Calculate intensity radius (approximate felt area)
  const getIntensityRadius = (magnitude: number) => {
      // Very rough approximation: 10^(0.5 * M - 1.8) * 1000 meters? 
      // Let's just use a visual scale for now.
      // M4 -> ~20km
      // M7 -> ~300km
      return Math.pow(2, magnitude) * 1000; 
  };

  const createCustomIcon = (event: SeismicEvent, isSelected: boolean) => {
    const color = getColor(event.magnitude || 0);
    const radius = getRadius(event.magnitude || 0);
    const size = radius * 2;
    
    const html = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        border: ${isSelected ? '3px' : '1px'} solid ${isSelected ? '#ffffff' : color};
        opacity: ${isSelected ? 1 : 0.7};
        box-shadow: 0 0 4px rgba(0,0,0,0.5);
      " class="${isSelected ? 'selected-event-marker' : ''}"></div>
    `;

    return L.divIcon({
      html,
      className: 'custom-seismic-marker',
      iconSize: [size, size],
      iconAnchor: [radius, radius],
      popupAnchor: [0, -radius]
    });
  };

  return (
    <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden relative z-0">
      <style>
        {`
          @keyframes pulse-marker {
            0% { stroke-width: 1px; stroke-opacity: 0.5; fill-opacity: 0.7; }
            50% { stroke-width: 4px; stroke-opacity: 1; fill-opacity: 1; stroke: #ffffff; }
            100% { stroke-width: 1px; stroke-opacity: 0.5; fill-opacity: 0.7; }
          }
          .selected-event-marker {
            animation: pulse-marker 1.5s infinite ease-in-out;
            stroke: #ffffff !important;
            z-index: 1000;
          }
          @keyframes pulse-zone {
            0% { fill-opacity: 0.1; stroke-opacity: 0; stroke-width: 0px; }
            50% { fill-opacity: 0.25; stroke-opacity: 0.8; stroke-width: 2px; stroke: #ffffff; }
            100% { fill-opacity: 0.1; stroke-opacity: 0; stroke-width: 0px; }
          }
          .selected-intensity-zone {
            animation: pulse-zone 2s infinite ease-in-out;
          }
        `}
      </style>
      <MapContainer 
        center={[15, -75]} 
        zoom={5} 
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <LayersControl position="topright">
            {/* ... (BaseLayers) */}
            <LayersControl.BaseLayer checked name="Dark Matter">
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Terrain">
                <TileLayer
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                    attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                />
            </LayersControl.BaseLayer>

            <LayersControl.Overlay checked name="Seismic Events">
                {/* ... (Events LayerGroup) */}
                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={40}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                >
                    {events.map((event) => {
                        const isSelected = selectedEvent?.id === event.id;
                        return (
                        <Marker
                            key={event.id}
                            position={[event.lat, event.lon]}
                            icon={createCustomIcon(event, isSelected)}
                            eventHandlers={{
                                click: () => {
                                    onEventSelect(event);
                                    setActiveEvent(event);
                                },
                                mouseover: (e) => {
                                    e.target.openPopup();
                                },
                                mouseout: (e) => {
                                    e.target.closePopup();
                                }
                            }}
                        >
                            <Popup closeButton={false} offset={[0, -10]}>
                                <div className="p-1 min-w-[150px]">
                                    <div className="font-bold text-slate-800 mb-1 text-sm">{event.location}</div>
                                    <div className="flex justify-between items-center mb-1 text-xs">
                                        <span className="text-slate-500 font-semibold">Magnitude</span>
                                        <span className={`font-mono font-bold ${(event.magnitude || 0) >= 6 ? 'text-red-600' : 'text-orange-600'}`}>
                                            M{event.magnitude?.toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-1 text-xs">
                                        <span className="text-slate-500 font-semibold">Depth</span>
                                        <span className="font-mono font-bold text-blue-600">
                                            {event.depth} km
                                        </span>
                                    </div>
                                    <div className="text-slate-500 text-xs mt-1 border-t pt-1 border-slate-200">
                                        {(() => {
                                            if (!event.date) return '-';
                                            const date = new Date(event.date);
                                            if (isNaN(date.getTime())) return event.date;
                                            try {
                                                return new Intl.DateTimeFormat('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric',
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                }).format(date);
                                            } catch (e) {
                                                return event.date;
                                            }
                                        })()}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )})}
                </MarkerClusterGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay checked name="Intensity Zones">
                {/* ... (Intensity Zones LayerGroup) */}
                <LayerGroup>
                    {events.filter(e => (e.magnitude || 0) >= 5).map((event) => {
                        const isSelected = selectedEvent?.id === event.id;
                        return (
                        <Circle
                            key={`zone-${event.id}`}
                            center={[event.lat, event.lon]}
                            radius={getIntensityRadius(event.magnitude || 0)}
                            pathOptions={{
                                color: isSelected ? '#ffffff' : getColor(event.magnitude || 0),
                                fillColor: getColor(event.magnitude || 0),
                                fillOpacity: isSelected ? 0.25 : 0.1,
                                weight: isSelected ? 2 : 0,
                                className: isSelected ? 'selected-intensity-zone' : ''
                            }}
                        />
                    )})}
                </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay checked name="Plate Boundaries">
                <LayerGroup>
                    {plates && plates.features.map((feature: any, index: number) => (
                        <Polyline 
                            key={`plate-${index}`}
                            positions={feature.geometry.coordinates.map((coord: any) => [coord[1], coord[0]])}
                            pathOptions={{ color: '#f59e0b', weight: 2, opacity: 0.6, dashArray: '5, 5' }}
                        />
                    ))}
                </LayerGroup>
            </LayersControl.Overlay>
        </LayersControl>
        
        <MapBounds events={events} />
      </MapContainer>
      
      {/* Custom Zoom Controls could go here if we disabled default ones, but default is fine */}
    </div>
  );
};

export default SeismicMap;
