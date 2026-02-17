import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { COLORS } from '../constants';
import { ChartDataPoint } from '../types';

interface RadarComparisonProps {
  data: ChartDataPoint[];
}

export const RadarComparison: React.FC<RadarComparisonProps> = ({ data }) => {
  return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid gridType="polygon" stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          
          <Radar
            name="June"
            dataKey="June"
            stroke={COLORS.June}
            strokeWidth={2}
            fill={COLORS.JuneFill}
            fillOpacity={0.3}
          />
          <Radar
            name="July"
            dataKey="July"
            stroke={COLORS.July}
            strokeWidth={3}
            fill={COLORS.JulyFill}
            fillOpacity={0.5}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
