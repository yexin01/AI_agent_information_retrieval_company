import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface AgentStepsProps {
  steps: string[];
  animateOnMount?: boolean;
}

export const AgentSteps: React.FC<AgentStepsProps> = ({ steps, animateOnMount = true }) => {
  const [visibleSteps, setVisibleSteps] = useState<number>(animateOnMount ? 0 : (steps?.length || 0));

  useEffect(() => {
    if (animateOnMount) {
      setVisibleSteps(0);
      const timers = steps.map((_, index) =>
        setTimeout(() => {
          setVisibleSteps(prev => prev + 1);
        }, index * 800) // Slower for more dramatic effect
      );
      return () => timers.forEach(clearTimeout);
    } else {
      setVisibleSteps(steps.length);
    }
  }, [steps, animateOnMount]);

  if (!steps || steps.length === 0) return null;

  const stepsToDisplay = animateOnMount ? steps.slice(0, visibleSteps) : steps;

  return (
    <div className="glass-panel rounded-xl p-6 border border-white/5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Agent Activity Log
      </h3>
      <div className="space-y-4 relative">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-800" />
        {stepsToDisplay.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-4 relative z-10",
              animateOnMount && "animate-in fade-in slide-in-from-left-4 duration-500"
            )}
          >
            <div className="mt-0.5 bg-slate-900 rounded-full p-0.5 border border-slate-800">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-slate-300 text-sm leading-relaxed py-0.5">{step}</span>
          </div>
        ))}
        {visibleSteps < steps.length && (
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center ml-[1px]">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            </div>
            <span className="text-cyan-500/70 text-sm italic">Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
};