import React from 'react';
import { InlineInput } from './InlineInput';
import { ArrowRight } from 'lucide-react';

interface MetricCellProps {
  previousValue: number;
  currentValue: number;
  isEditing: boolean;
  onUpdate: (prev: number, curr: number) => void;
  unit?: string;
  maxValue?: number;
  lowerIsBetter?: boolean;
  variant?: 'chart' | 'text';
}

export const MetricCell: React.FC<MetricCellProps> = ({ 
  previousValue, 
  currentValue, 
  isEditing,
  onUpdate,
  unit = '',
  maxValue = 100,
  lowerIsBetter = false,
  variant = 'chart'
}) => {
  const diff = currentValue - previousValue;
  const isFloat = unit === 's'; // Heuristic for seconds usually needing decimals
  
  // Logic for color coding: 
  const isImprovement = lowerIsBetter ? diff < 0 : diff > 0;
  const isNeutral = diff === 0;

  // Visual configuration
  let strokeColor = '#cbd5e1'; // Slate 300
  let fillColor = '#cbd5e1';
  let diffTextColor = 'text-slate-400';
  let diffBgColor = 'bg-slate-100';
  
  if (!isNeutral) {
    if (isImprovement) {
      strokeColor = '#10b981'; // Emerald 500
      fillColor = '#10b981';
      diffTextColor = 'text-emerald-700';
      diffBgColor = 'bg-emerald-50';
    } else {
      strokeColor = '#f43f5e'; // Rose 500
      fillColor = '#f43f5e';
      diffTextColor = 'text-rose-700';
      diffBgColor = 'bg-rose-50';
    }
  } else if (!lowerIsBetter && currentValue > 80) {
      strokeColor = '#6366f1'; 
      fillColor = '#6366f1';
      diffTextColor = 'text-indigo-700';
      diffBgColor = 'bg-indigo-50';
  } else if (lowerIsBetter && currentValue < (maxValue * 0.4)) {
      strokeColor = '#6366f1';
      fillColor = '#6366f1';
      diffTextColor = 'text-indigo-700';
      diffBgColor = 'bg-indigo-50';
  }

  const handlePrevChange = (val: string) => {
    const num = isFloat ? parseFloat(val) : parseInt(val, 10);
    if (!isNaN(num)) onUpdate(num, currentValue);
  };

  const handleCurrChange = (val: string) => {
    const num = isFloat ? parseFloat(val) : parseInt(val, 10);
    if (!isNaN(num)) onUpdate(previousValue, num);
  };

  const formatValue = (val: number) => {
    if (isFloat) return val.toFixed(1);
    return Math.round(val).toString();
  };

  const formattedDiff = isFloat ? Math.abs(diff).toFixed(1) : Math.abs(diff);

  // --- TEXT VARIANT (Core Vitals) ---
  if (variant === 'text') {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-2 transition-all ${isEditing ? 'ring-1 ring-indigo-100 bg-slate-50/50' : ''}`}>
        <div className="flex flex-col items-center gap-1">
           {/* Previous Value (Muted) */}
           <div className="text-xs font-medium text-slate-400 line-through decoration-slate-300">
              {isEditing ? (
                 <InlineInput 
                   value={previousValue} 
                   onChange={handlePrevChange} 
                   className="bg-white border border-slate-300 rounded px-1 text-center w-12 no-underline"
                 />
              ) : (
                <span>{formatValue(previousValue)}{unit}</span>
              )}
           </div>
           
           <ArrowRight className="w-3 h-3 text-slate-300 rotate-90" />

           {/* Current Value (Bold) */}
           <div className={`text-base font-bold ${isNeutral ? 'text-slate-700' : isImprovement ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isEditing ? (
                 <InlineInput 
                   value={currentValue} 
                   onChange={handleCurrChange} 
                   className="bg-white border border-slate-300 rounded px-1 text-center w-12"
                 />
              ) : (
                <span>{formatValue(currentValue)}{unit}</span>
              )}
           </div>
           
           {/* Diff Pill */}
           {!isNeutral && (
             <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${diffBgColor} ${diffTextColor}`}>
               {diff > 0 ? '+' : ''}{formattedDiff}
             </span>
           )}
        </div>
      </div>
    );
  }

  // --- CHART VARIANT (Scores) ---
  // Calculate percentages for the chart based on maxValue
  const prevPercent = Math.min((previousValue / maxValue) * 100, 100);
  const currPercent = Math.min((currentValue / maxValue) * 100, 100);
  
  return (
    <div className={`w-full h-full flex flex-col justify-center px-4 py-3 transition-all ${isEditing ? 'ring-1 ring-indigo-100 bg-slate-50/50' : ''}`}>
      {/* Stats Row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-baseline gap-1.5">
            <div className="text-xs font-medium text-slate-400 min-w-[2ch] text-right">
            {isEditing ? (
                <InlineInput 
                    value={previousValue} 
                    onChange={handlePrevChange} 
                    className="bg-white border border-slate-300 rounded px-1 text-slate-600 w-full text-right"
                />
            ) : (
                <span>{formatValue(previousValue)}</span>
            )}
            </div>
            <span className="text-slate-300 text-[10px]">→</span>
            <div className="text-lg font-bold text-slate-800 min-w-[2ch]">
            {isEditing ? (
                <InlineInput 
                    value={currentValue} 
                    onChange={handleCurrChange} 
                    className="bg-white border border-slate-300 rounded px-1 text-slate-900 w-full"
                />
            ) : (
                <span>{formatValue(currentValue)}</span>
            )}
            </div>
        </div>
        
        {/* Diff Badge */}
        <div className={`px-2 py-0.5 rounded text-xs font-bold ${diffBgColor} ${diffTextColor}`}>
          {diff > 0 ? '+' : diff < 0 ? '' : ''}{formattedDiff}
        </div>
      </div>

      {/* Visualization Wrapper */}
      <div className="w-full">
         {/* Chart Track - Fixed Height */}
         <div className="relative h-6 w-full">
             {/* Grid Lines */}
             <div className="absolute top-0 left-0 w-full h-full flex justify-between pointer-events-none">
                 <div className="w-px h-full bg-slate-50"></div>
                 <div className="w-px h-full bg-slate-50"></div>
                 <div className="w-px h-full bg-slate-50"></div>
             </div>

             {/* SVG Chart */}
             <svg width="100%" height="100%" className="overflow-visible relative z-10">
                {/* Track */}
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" />
                
                {/* Active Range */}
                <line 
                  x1={`${prevPercent}%`} 
                  y1="50%" 
                  x2={`${currPercent}%`} 
                  y2="50%" 
                  stroke={strokeColor} 
                  strokeWidth="4" 
                  strokeOpacity="0.4"
                  strokeLinecap="round"
                />

                {/* Start Dot */}
                <circle cx={`${prevPercent}%`} cy="50%" r="3" fill="#cbd5e1" stroke="white" strokeWidth="1.5" />
                
                {/* End Dot */}
                <circle cx={`${currPercent}%`} cy="50%" r="5" fill={fillColor} stroke="white" strokeWidth="1.5" />
             </svg>
         </div>

         {/* Axis Labels - Natural Flow below chart */}
         <div className="flex justify-between text-[8px] font-semibold text-slate-300 -mt-0.5 uppercase tracking-wider px-0.5">
            <span>0</span>
            <span>50</span>
            <span>100</span>
         </div>
      </div>
    </div>
  );
};