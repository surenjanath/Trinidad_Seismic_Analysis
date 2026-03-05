
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { SeismicEvent } from '../src/services/SeismicService';

interface SeismicMagnitudeDistProps {
  events: SeismicEvent[];
}

const SeismicMagnitudeDist: React.FC<SeismicMagnitudeDistProps> = ({ events }) => {
  const chartData = useMemo(() => {
    const bins = {
      '< 3': 0,
      '3 - 4': 0,
      '4 - 5': 0,
      '5 - 6': 0,
      '> 6': 0
    };

    events.forEach(event => {
      const mag = event.magnitude || 0;
      if (mag < 3) bins['< 3']++;
      else if (mag < 4) bins['3 - 4']++;
      else if (mag < 5) bins['4 - 5']++;
      else if (mag < 6) bins['5 - 6']++;
      else bins['> 6']++;
    });

    return Object.entries(bins).map(([range, count]) => ({
      range,
      count
    }));
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-display font-medium text-slate-200">Magnitude Distribution</h3>
        <p className="text-xs text-slate-500">Number of events by magnitude range</p>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              bottom: 10,
              left: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
                dataKey="range" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                dy={10}
            />
            <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                dx={-10}
            />
            <Tooltip 
                cursor={{ fill: '#1e293b' }}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}
                itemStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                        index === 0 ? '#10b981' : // < 3
                        index === 1 ? '#34d399' : // 3-4
                        index === 2 ? '#fbbf24' : // 4-5
                        index === 3 ? '#f97316' : // 5-6
                        '#ef4444' // > 6
                    } />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SeismicMagnitudeDist;
