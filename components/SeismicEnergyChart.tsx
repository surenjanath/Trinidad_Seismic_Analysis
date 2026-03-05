import React from 'react';
import { SeismicEvent } from '../src/services/SeismicService';
import { format, parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SeismicEnergyChartProps {
  events: SeismicEvent[];
}

const SeismicEnergyChart: React.FC<SeismicEnergyChartProps> = ({ events }) => {
  // Calculate energy release
  // Formula: log E = 4.8 + 1.5M (in Joules)
  // E = 10^(4.8 + 1.5M)
  const chartData = events
    .filter(e => e.date && e.magnitude)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(event => {
      const magnitude = event.magnitude || 0;
      const energy = Math.pow(10, 4.8 + 1.5 * magnitude);
      return {
        date: event.date,
        dateObj: new Date(event.date).getTime(),
        energy: energy,
        magnitude: magnitude,
        location: event.location
      };
    });

  if (chartData.length === 0) return null;

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="mb-4 relative z-10">
        <h3 className="font-display font-medium text-slate-200 flex items-center gap-2">
            Seismic Energy Release
            <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 text-[10px] font-mono border border-orange-500/20">LOG SCALE</span>
        </h3>
        <p className="text-xs text-slate-500">Estimated energy released (Joules) over time</p>
      </div>

      <div className="flex-1 min-h-[200px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
                dataKey="dateObj" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(unixTime) => format(new Date(unixTime), 'MMM yy')}
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                dy={10}
            />
            <YAxis 
                scale="log"
                domain={['auto', 'auto']}
                stroke="#64748b" 
                fontSize={10} 
                tickFormatter={(value) => value.toExponential(0)}
                tickLine={false}
                axisLine={false}
                dx={-10}
                width={40}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}
                itemStyle={{ fontSize: '12px', color: '#cbd5e1' }}
                labelFormatter={(label) => format(new Date(label), 'PP')}
                formatter={(value: number) => [value.toExponential(2) + ' J', 'Energy']}
            />
            <Area 
                type="monotone" 
                dataKey="energy" 
                stroke="#f97316" 
                fillOpacity={1} 
                fill="url(#colorEnergy)" 
                strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SeismicEnergyChart;
