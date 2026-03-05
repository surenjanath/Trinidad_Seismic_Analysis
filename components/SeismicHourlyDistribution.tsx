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

const SeismicHourlyDistribution: React.FC<Props> = ({ events }) => {
  const data = useMemo(() => {
    if (events.length === 0) return [];

    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));

    events.forEach(event => {
      if (!event.date) return;
      const date = new Date(event.date);
      if (isNaN(date.getTime())) return;
      
      const hour = date.getHours();
      hours[hour].count += 1;
    });

    return hours;
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-display font-medium text-slate-200">Hourly Distribution</h3>
        <p className="text-xs text-slate-500">Event frequency by hour of day (UTC)</p>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="hour" 
              tickCount={24}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
              label={{ value: 'Hour (UTC)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }}
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
              labelFormatter={(label) => `${label}:00 - ${label}:59`}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SeismicHourlyDistribution;
