import React from 'react';
import { cn } from '../lib/utils';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  delay?: number;
  compact?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, delay = 0, compact = false }) => {
  const isNA = value === 'N/A';

  return (
    <div
      className={cn(
        "glass-card rounded-xl border border-white/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards",
        compact ? "p-4" : "p-5"
      )}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "text-cyan-400 p-2 rounded-lg bg-cyan-500/10",
          compact && "p-1.5"
        )}>
          {React.cloneElement(icon as React.ReactElement, {
            className: cn("w-5 h-5", compact && "w-4 h-4")
          })}
        </div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
      </div>
      <p
        className={cn(
          "font-bold text-white tracking-tight truncate",
          compact ? "text-lg" : "text-2xl",
          isNA && "text-slate-600 font-normal"
        )}
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
};
