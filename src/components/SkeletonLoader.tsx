
import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-2xl animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-slate-700 rounded w-3/5"></div>
        <div className="h-10 bg-slate-700 rounded w-32"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="h-5 bg-slate-700 rounded w-1/3 mb-3"></div>
            <div className="h-7 bg-slate-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
