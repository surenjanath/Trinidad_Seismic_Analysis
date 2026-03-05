import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, LayerGroup, Circle, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { SeismicEvent } from '../src/services/SeismicService';
import L from 'leaflet';

// ... (existing imports and icon fix)

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

const SeismicMap: React.FC<SeismicMapProps> = ({ events, onEventSelect }) => {
  const [activeEvent, setActiveEvent] = useState<SeismicEvent | null>(null);
  const [plates, setPlates] = useState<any>(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
      .then(res => res.json())
      .then(data => setPlates(data));
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

  return (
    <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden relative z-0">
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
                <LayerGroup>
                    {events.map((event) => (
                        <CircleMarker
                            key={event.id}
                            center={[event.lat, event.lon]}
                            radius={getRadius(event.magnitude || 0)}
                            pathOptions={{
                                color: getColor(event.magnitude || 0),
                                fillColor: getColor(event.magnitude || 0),
                                fillOpacity: 0.7,
                                weight: 1
                            }}
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
                        </CircleMarker>
                    ))}
                </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Intensity Zones">
                {/* ... (Intensity Zones LayerGroup) */}
                <LayerGroup>
                    {events.filter(e => (e.magnitude || 0) >= 4).map((event) => (
                        <Circle
                            key={`zone-${event.id}`}
                            center={[event.lat, event.lon]}
                            radius={getIntensityRadius(event.magnitude || 0)}
                            pathOptions={{
                                color: getColor(event.magnitude || 0),
                                fillColor: getColor(event.magnitude || 0),
                                fillOpacity: 0.1,
                                weight: 0
                            }}
                        />
                    ))}
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
