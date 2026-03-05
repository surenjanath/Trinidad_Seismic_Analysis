
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { SeismicEvent } from '../src/services/SeismicService';
import { format, parseISO, isValid } from 'date-fns';

interface SeismicTrendChartProps {
  events: SeismicEvent[];
}

const SeismicTrendChart: React.FC<SeismicTrendChartProps> = ({ events }) => {
  const chartData = useMemo(() => {
    // Group by month
    const groupedData: Record<string, { date: string; count: number; avgMagnitude: number; totalMagnitude: number }> = {};

    events.forEach(event => {
      if (!event.date) return;
      
      let dateObj: Date | null = null;
      try {
          dateObj = new Date(event.date);
          if (!isValid(dateObj)) return;
      } catch (e) {
          return;
      }

      const monthKey = format(dateObj, 'yyyy-MM'); // Group by Year-Month

      if (!groupedData[monthKey]) {
        groupedData[monthKey] = {
          date: monthKey,
          count: 0,
          avgMagnitude: 0,
          totalMagnitude: 0
        };
      }

      groupedData[monthKey].count += 1;
      groupedData[monthKey].totalMagnitude += (event.magnitude || 0);
    });

    // Calculate averages and convert to array
    return Object.values(groupedData)
      .map(item => ({
        ...item,
        avgMagnitude: item.count > 0 ? parseFloat((item.totalMagnitude / item.count).toFixed(2)) : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically
  }, [events]);

  if (events.length === 0) {
      return <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-sm">NO TREND DATA AVAILABLE</div>;
  }

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm h-full flex flex-col">
      <div className="mb-4 flex justify-between items-end">
        <div>
            <h3 className="font-display font-medium text-slate-200">Activity Trends</h3>
            <p className="text-xs text-slate-500">Frequency and magnitude over time</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={10} 
                tickFormatter={(value) => {
                    try {
                        return format(parseISO(value), 'MMM yy');
                    } catch {
                        return value;
                    }
                }}
                tickLine={false}
                axisLine={false}
                dy={10}
            />
            <YAxis 
                yAxisId="left" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                dx={-10}
            />
            <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#f97316" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                dx={10}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}
                itemStyle={{ fontSize: '12px' }}
                labelFormatter={(value) => {
                    try {
                        return format(parseISO(value), 'MMMM yyyy');
                    } catch {
                        return value;
                    }
                }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Line yAxisId="left" type="monotone" dataKey="count" name="Event Count" stroke="#94a3b8" activeDot={{ r: 6, fill: '#fff' }} strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="avgMagnitude" name="Avg Magnitude" stroke="#f97316" strokeWidth={2} dot={{r: 3, fill: '#f97316'}} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SeismicTrendChart;
