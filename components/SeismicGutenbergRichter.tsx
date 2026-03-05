import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
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

const SeismicGutenbergRichter: React.FC<Props> = ({ events }) => {
  const data = useMemo(() => {
    if (events.length === 0) return [];

    // 1. Get all magnitudes, rounded to 1 decimal place
    const magnitudes = events
      .map(e => e.magnitude || 0)
      .filter(m => m > 0)
      .map(m => Math.floor(m * 10) / 10) // Round down to nearest 0.1
      .sort((a, b) => a - b);

    if (magnitudes.length === 0) return [];

    const minMag = magnitudes[0];
    const maxMag = magnitudes[magnitudes.length - 1];
    
    // 2. Create bins from min to max with 0.1 step
    const bins: { mag: number; count: number; cumulative: number; logCumulative: number }[] = [];
    
    for (let m = minMag; m <= maxMag + 0.1; m += 0.1) {
        // Fix float precision issues
        const mag = Math.round(m * 10) / 10;
        
        // Count events with magnitude >= mag (Cumulative)
        const count = magnitudes.filter(val => val >= mag).length;
        
        if (count > 0) {
            bins.push({
                mag,
                count: magnitudes.filter(val => val === mag).length, // Discrete count
                cumulative: count,
                logCumulative: Math.log10(count)
            });
        }
    }

    return bins;
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-display font-medium text-slate-200">Gutenberg-Richter Law</h3>
        <p className="text-xs text-slate-500">Frequency-Magnitude distribution (Log-Linear)</p>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="mag" 
              type="number" 
              domain={['dataMin', 'dataMax']} 
              tickCount={10}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
              label={{ value: 'Magnitude (M)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }}
            />
            <YAxis 
              yAxisId="left"
              label={{ value: 'Log10 (Cumulative Count)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
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
              formatter={(value: number, name: string) => [
                  name === 'logCumulative' ? value.toFixed(2) : value, 
                  name === 'logCumulative' ? 'Log(N)' : 'Count'
              ]}
              labelFormatter={(label) => `Magnitude ≥ ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="logCumulative" 
                name="Log10 Cumulative Frequency" 
                stroke="#f97316" 
                strokeWidth={2} 
                dot={{ r: 2, fill: '#f97316' }} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SeismicGutenbergRichter;
