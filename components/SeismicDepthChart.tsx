
import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis
} from 'recharts';
import { SeismicEvent } from '../src/services/SeismicService';
import { format, parseISO, isValid } from 'date-fns';

interface SeismicDepthChartProps {
  events: SeismicEvent[];
  selectedEvent?: SeismicEvent | null;
}

const SeismicDepthChart: React.FC<SeismicDepthChartProps> = ({ events, selectedEvent }) => {
  const chartData = useMemo(() => {
    return events
      .filter(e => e.depth !== undefined && e.date)
      .map(e => {
        let dateObj: Date | null = null;
        try {
            dateObj = new Date(e.date);
            if (!isValid(dateObj)) return null;
        } catch {
            return null;
        }
        return {
            ...e,
            dateObj: dateObj.getTime(),
            depth: e.depth || 0,
            magnitude: e.magnitude || 0
        };
      })
      .filter(Boolean) as any[];
  }, [events]);

  const selectedData = useMemo(() => {
    if (!selectedEvent || !selectedEvent.date) return [];
    let dateObj: Date | null = null;
    try {
        dateObj = new Date(selectedEvent.date);
        if (!isValid(dateObj)) return [];
    } catch {
        return [];
    }
    return [{
        ...selectedEvent,
        dateObj: dateObj.getTime(),
        depth: selectedEvent.depth || 0,
        magnitude: selectedEvent.magnitude || 0
    }];
  }, [selectedEvent]);

  if (events.length === 0) return null;

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-display font-medium text-slate-200">Depth vs. Magnitude</h3>
        <p className="text-xs text-slate-500">Event depth (km) over time, sized by magnitude</p>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 10,
              right: 10,
              bottom: 10,
              left: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
                type="number" 
                dataKey="dateObj" 
                name="Date" 
                domain={['auto', 'auto']}
                tickFormatter={(unixTime) => format(new Date(unixTime), 'MMM d')}
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
            />
            <YAxis 
                type="number" 
                dataKey="depth" 
                name="Depth" 
                unit="km" 
                reversed 
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dx={-10}
            />
            <ZAxis type="number" dataKey="magnitude" range={[50, 400]} name="Magnitude" />
            <Tooltip 
                cursor={{ strokeDasharray: '3 3', stroke: '#475569' }}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                            <div className="bg-slate-900 p-3 border border-slate-700 shadow-lg rounded-lg text-xs">
                                <p className="font-bold text-slate-200 mb-1">{format(new Date(data.dateObj), 'PP p')}</p>
                                <p className="text-slate-400">Magnitude: <span className="font-mono font-bold text-orange-500">M{data.magnitude.toFixed(1)}</span></p>
                                <p className="text-slate-400">Depth: <span className="font-mono font-bold text-blue-400">{data.depth} km</span></p>
                                <p className="text-slate-500 mt-1 max-w-[200px] truncate">{data.location}</p>
                            </div>
                        );
                    }
                    return null;
                }}
            />
            <Scatter name="Events" data={chartData} fill="#f97316" fillOpacity={0.6} stroke="#fff" strokeWidth={1} />
            {selectedData.length > 0 && (
                <Scatter name="Selected" data={selectedData} fill="#ef4444" stroke="#fff" strokeWidth={2} shape="star" />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SeismicDepthChart;
