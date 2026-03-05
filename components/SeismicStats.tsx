
import React from 'react';
import { SeismicEvent } from '../src/services/SeismicService';
import { Activity, Zap, TrendingUp, ArrowUpRight } from 'lucide-react';

interface SeismicStatsProps {
  events: SeismicEvent[];
}

const SeismicStats: React.FC<SeismicStatsProps> = ({ events }) => {
  const totalEvents = events.length;
  const maxMagnitude = events.reduce((max, event) => Math.max(max, event.magnitude || 0), 0);
  const avgMagnitude = events.reduce((sum, event) => sum + (event.magnitude || 0), 0) / (totalEvents || 1);
  const maxDepth = events.reduce((max, event) => Math.max(max, event.depth || 0), 0);
  
  // Find the event with max magnitude
  const strongestEvent = events.find(e => (e.magnitude || 0) === maxMagnitude);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Events Card */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between group hover:border-orange-500/30 transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={48} className="text-orange-500" />
        </div>
        <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Events</span>
            <div className="p-1.5 bg-slate-800 rounded text-orange-500">
                <Activity size={14} />
            </div>
        </div>
        <div className="relative z-10">
            <p className="text-3xl font-display font-bold text-white mb-1">{totalEvents}</p>
            <p className="text-xs text-slate-500">Recorded in current view</p>
        </div>
      </div>

      {/* Max Magnitude Card */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between group hover:border-red-500/30 transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={48} className="text-red-500" />
        </div>
        <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Magnitude</span>
            <div className="p-1.5 bg-slate-800 rounded text-red-500">
                <Zap size={14} />
            </div>
        </div>
        <div className="relative z-10">
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-display font-bold text-red-500 mb-1">M{maxMagnitude.toFixed(1)}</p>
            </div>
            <p className="text-xs text-slate-500 truncate" title={strongestEvent?.location}>
                {strongestEvent?.location || 'Unknown location'}
            </p>
        </div>
      </div>

      {/* Average Magnitude Card */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between group hover:border-orange-400/30 transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={48} className="text-orange-400" />
        </div>
        <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Magnitude</span>
            <div className="p-1.5 bg-slate-800 rounded text-orange-400">
                <TrendingUp size={14} />
            </div>
        </div>
        <div className="relative z-10">
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-display font-bold text-orange-400 mb-1">M{avgMagnitude.toFixed(1)}</p>
            </div>
            <p className="text-xs text-slate-500">Mean across region</p>
        </div>
      </div>

      {/* Max Depth Card */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between group hover:border-blue-500/30 transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpRight size={48} className="text-blue-500 rotate-180" />
        </div>
        <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Depth</span>
            <div className="p-1.5 bg-slate-800 rounded text-blue-500">
                <ArrowUpRight size={14} className="rotate-180" />
            </div>
        </div>
        <div className="relative z-10">
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-display font-bold text-white mb-1">{maxDepth}</p>
                <span className="text-xs text-slate-500 font-mono">km</span>
            </div>
            <p className="text-xs text-slate-500">Deepest recorded event</p>
        </div>
      </div>
    </div>
  );
};

export default SeismicStats;
