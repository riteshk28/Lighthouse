import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Dataset, MetricKey } from '../types';
import { COLORS } from '../constants';

interface OverviewChartProps {
  data: Dataset;
  selectedMetric: MetricKey | 'All';
}

export const OverviewChart: React.FC<OverviewChartProps> = ({ data, selectedMetric }) => {
  const chartData = Object.keys(data).map(page => {
    const pageMetrics = data[page];
    
    let juneVal = 0;
    let julyVal = 0;

    if (selectedMetric === 'All') {
      const metrics = Object.keys(pageMetrics) as MetricKey[];
      juneVal = Math.round(metrics.reduce((acc, m) => acc + pageMetrics[m].June, 0) / metrics.length);
      julyVal = Math.round(metrics.reduce((acc, m) => acc + pageMetrics[m].July, 0) / metrics.length);
    } else {
      juneVal = pageMetrics[selectedMetric].June;
      julyVal = pageMetrics[selectedMetric].July;
    }

    return {
      name: page,
      June: juneVal,
      July: julyVal,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
        barSize={20}
        barGap={8}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
          axisLine={false}
          tickLine={false}
          dy={5}
          interval={0}
        />
        <YAxis 
          tick={{ fill: '#94a3b8', fontSize: 10 }} 
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          ticks={[0, 50, 100]}
        />
        <Tooltip 
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', padding: '8px' }}
        />
        <Bar 
          dataKey="June" 
          fill={COLORS.June} 
          radius={[3, 3, 0, 0]} 
        />
        <Bar 
          dataKey="July" 
          fill={COLORS.July} 
          radius={[3, 3, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};