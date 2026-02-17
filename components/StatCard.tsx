import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  june: number;
  july: number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, june, july }) => {
  const diff = july - june;
  const percentage = ((diff / june) * 100).toFixed(1);
  
  let Icon = Minus;
  let colorClass = 'text-slate-500';
  let bgClass = 'bg-slate-100';

  if (diff > 0) {
    Icon = ArrowUpRight;
    colorClass = 'text-emerald-600';
    bgClass = 'bg-emerald-50';
  } else if (diff < 0) {
    Icon = ArrowDownRight;
    colorClass = 'text-rose-600';
    bgClass = 'bg-rose-50';
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
        <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${bgClass} ${colorClass}`}>
          <Icon size={12} className="mr-1" />
          {Math.abs(diff)} pts
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-800">{july}</span>
        <span className="text-sm text-slate-400 font-medium">from {june}</span>
      </div>
      <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-full rounded-full ${diff >= 0 ? 'bg-indigo-500' : 'bg-slate-400'}`} 
          style={{ width: `${Math.min(july, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};
