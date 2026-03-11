import React, { useState, useMemo } from 'react';
import { SeismicEvent } from '../src/services/SeismicService';
import { format, parseISO, isValid } from 'date-fns';
import { ArrowRight, Activity, MapPin, Clock, Zap, ArrowDown } from 'lucide-react';

interface Props {
  events: SeismicEvent[];
}

const SeismicComparison: React.FC<Props> = ({ events }) => {
  const [eventAId, setEventAId] = useState<string>('');
  const [eventBId, setEventBId] = useState<string>('');

  const eventA = useMemo(() => events.find(e => e.id === eventAId) || null, [events, eventAId]);
  const eventB = useMemo(() => events.find(e => e.id === eventBId) || null, [events, eventBId]);

  // Set defaults if not selected
  React.useEffect(() => {
    if (events.length >= 2) {
      if (!eventAId) setEventAId(events[0].id);
      if (!eventBId) setEventBId(events[1].id);
    }
  }, [events]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };

  const calculateEnergy = (magnitude: number) => {
    // E = 10^(4.8 + 1.5 * M) Joules
    return Math.pow(10, 4.8 + 1.5 * magnitude);
  };

  const formatEnergy = (joules: number) => {
    if (joules >= 1e15) return `${(joules / 1e15).toFixed(2)} PetaJoules`;
    if (joules >= 1e12) return `${(joules / 1e12).toFixed(2)} TeraJoules`;
    if (joules >= 1e9) return `${(joules / 1e9).toFixed(2)} GigaJoules`;
    return `${(joules / 1e6).toFixed(2)} MegaJoules`;
  };

  const energyRatio = useMemo(() => {
    if (!eventA || !eventB) return null;
    const eA = calculateEnergy(eventA.magnitude || 0);
    const eB = calculateEnergy(eventB.magnitude || 0);
    if (eA > eB) return { ratio: eA / eB, stronger: 'A' };
    return { ratio: eB / eA, stronger: 'B' };
  }, [eventA, eventB]);

  const distance = useMemo(() => {
    if (!eventA || !eventB) return null;
    return calculateDistance(eventA.lat, eventA.lon, eventB.lat, eventB.lon);
  }, [eventA, eventB]);

  const timeDiff = useMemo(() => {
    if (!eventA?.date || !eventB?.date) return null;
    const dA = new Date(eventA.date).getTime();
    const dB = new Date(eventB.date).getTime();
    const diffHours = Math.abs(dA - dB) / (1000 * 60 * 60);
    if (diffHours < 24) return `${diffHours.toFixed(1)} hours`;
    return `${(diffHours / 24).toFixed(1)} days`;
  }, [eventA, eventB]);

  if (events.length < 2) {
    return <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">NOT ENOUGH DATA FOR COMPARISON</div>;
  }

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-display font-medium text-slate-200">Event Comparison</h3>
        <p className="text-xs text-slate-500">Compare magnitude, depth, and energy between two events</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-mono text-slate-500 mb-1">EVENT A</label>
          <select 
            value={eventAId} 
            onChange={(e) => setEventAId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-3 py-2 outline-none focus:border-orange-500 truncate"
          >
            {events.map(e => (
              <option key={`a-${e.id}`} value={e.id}>
                M{e.magnitude?.toFixed(1)} - {e.location} ({format(new Date(e.date || ''), 'MMM d')})
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center justify-center pt-5 hidden md:flex">
          <ArrowRight className="text-slate-600" size={20} />
        </div>

        <div className="flex-1">
          <label className="block text-xs font-mono text-slate-500 mb-1">EVENT B</label>
          <select 
            value={eventBId} 
            onChange={(e) => setEventBId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-3 py-2 outline-none focus:border-blue-500 truncate"
          >
            {events.map(e => (
              <option key={`b-${e.id}`} value={e.id}>
                M{e.magnitude?.toFixed(1)} - {e.location} ({format(new Date(e.date || ''), 'MMM d')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {eventA && eventB && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Event A Details */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 flex flex-col justify-between">
            <div>
                <div className="text-orange-500 text-xs font-mono font-bold mb-2">EVENT A</div>
                <h4 className="text-slate-200 font-medium text-sm mb-4">{eventA.location}</h4>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-400 text-xs"><Activity size={14}/> Magnitude</div>
                        <div className="font-mono font-bold text-orange-400 text-lg">M{eventA.magnitude?.toFixed(1)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-400 text-xs"><ArrowDown size={14}/> Depth</div>
                        <div className="font-mono text-slate-300">{eventA.depth} km</div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-400 text-xs"><Zap size={14}/> Energy</div>
                        <div className="font-mono text-slate-300 text-xs">{formatEnergy(calculateEnergy(eventA.magnitude || 0))}</div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-400 text-xs"><Clock size={14}/> Date</div>
                        <div className="font-mono text-slate-300 text-xs">{format(new Date(eventA.date || ''), 'MMM d, yyyy HH:mm')}</div>
                    </div>
                </div>
            </div>
          </div>

          {/* Comparison Stats */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 flex flex-col items-center justify-center text-center space-y-6">
             <div>
                 <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Energy Difference</div>
                 {energyRatio && (
                     <div className="text-slate-200 text-sm">
                         Event {energyRatio.stronger} released <br/>
                         <span className="text-2xl font-bold text-emerald-400 font-mono my-1 block">
                             {energyRatio.ratio.toFixed(1)}x
                         </span>
                         more energy
                     </div>
                 )}
             </div>

             <div className="w-full h-px bg-slate-800"></div>

             <div>
                 <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Spatial Distance</div>
                 <div className="text-slate-200 font-mono text-lg">
                     {distance?.toFixed(0)} km apart
                 </div>
             </div>

             <div className="w-full h-px bg-slate-800"></div>

             <div>
                 <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Time Difference</div>
                 <div className="text-slate-200 font-mono text-lg">
                     {timeDiff}
                 </div>
             </div>
          </div>

          {/* Event B Details */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 flex flex-col justify-between">
            <div>
                <div className="text-blue-500 text-xs font-mono font-bold mb-2">EVENT B</div>
                <h4 className="text-slate-200 font-medium text-sm mb-4">{eventB.location}</h4>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-400 text-xs"><Activity size={14}/> Magnitude</div>
                        <div className="font-mono font-bold text-blue-400 text-lg">M{eventB.magnitude?.toFixed(1)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-400 text-xs"><ArrowDown size={14}/> Depth</div>
                        <div className="font-mono text-slate-300">{eventB.depth} km</div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-400 text-xs"><Zap size={14}/> Energy</div>
                        <div className="font-mono text-slate-300 text-xs">{formatEnergy(calculateEnergy(eventB.magnitude || 0))}</div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-400 text-xs"><Clock size={14}/> Date</div>
                        <div className="font-mono text-slate-300 text-xs">{format(new Date(eventB.date || ''), 'MMM d, yyyy HH:mm')}</div>
                    </div>
                </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SeismicComparison;
