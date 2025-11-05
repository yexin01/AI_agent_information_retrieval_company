
import React from 'react';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 transition-all duration-300 hover:border-cyan-500 hover:bg-slate-700/50">
      <div className="flex items-center gap-3">
        <div className="text-cyan-400">{icon}</div>
        <p className="text-sm text-slate-400">{title}</p>
      </div>
      <p className="text-xl lg:text-2xl font-semibold text-white mt-2 truncate" title={value}>
        {value}
      </p>
    </div>
  );
};
