import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface AgentStepsProps {
  steps: string[];
}

export const AgentSteps: React.FC<AgentStepsProps> = ({ steps }) => {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);

  useEffect(() => {
    setVisibleSteps(0); 
    if (steps && steps.length > 0) {
      const timers = steps.map((_, index) => 
        setTimeout(() => {
          setVisibleSteps(prev => prev + 1);
        }, index * 400)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [steps]);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-300 mb-3">Agent Activity</h3>
      <ul className="space-y-2">
        {steps.slice(0, visibleSteps).map((step, index) => (
          <li key={index} className="flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-400">{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
