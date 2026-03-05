import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { SeismicEvent } from '../src/services/SeismicService';

interface Props {
  events: SeismicEvent[];
}

const SeismicDepthDistribution: React.FC<Props> = ({ events }) => {
  const data = useMemo(() => {
    if (events.length === 0) return [];

    const bins = [
      { range: '0-10', min: 0, max: 10, count: 0 },
      { range: '10-30', min: 10, max: 30, count: 0 },
      { range: '30-70', min: 30, max: 70, count: 0 },
      { range: '70-150', min: 70, max: 150, count: 0 },
      { range: '150-300', min: 150, max: 300, count: 0 },
      { range: '>300', min: 300, max: 9999, count: 0 },
    ];

    events.forEach(event => {
      const depth = event.depth || 0;
      const bin = bins.find(b => depth >= b.min && depth < b.max);
      if (bin) {
        bin.count += 1;
      }
    });

    return bins;
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-display font-medium text-slate-200">Depth Distribution</h3>
        <p className="text-xs text-slate-500">Event frequency by depth range (km)</p>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="range" 
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
              label={{ value: 'Depth Range (km)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}
              labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
              itemStyle={{ fontSize: '12px' }}
              formatter={(value: number) => [value, 'Events']}
              labelFormatter={(label) => `${label} km`}
            />
            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SeismicDepthDistribution;
