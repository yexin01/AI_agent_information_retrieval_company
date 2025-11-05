import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface AgentStepsProps {
  steps: string[];
  animateOnMount?: boolean;
}

export const AgentSteps: React.FC<AgentStepsProps> = ({ steps, animateOnMount = true }) => {
  // If not animating, start with all steps visible. Otherwise, start with 0.
  const [visibleSteps, setVisibleSteps] = useState<number>(animateOnMount ? 0 : (steps?.length || 0));

  useEffect(() => {
    if (animateOnMount) {
      setVisibleSteps(0);
      const timers = steps.map((_, index) =>
        setTimeout(() => {
          setVisibleSteps(prev => prev + 1);
        }, index * 400)
      );
      return () => timers.forEach(clearTimeout);
    } else {
      // Ensure all steps are visible if animation is disabled
      setVisibleSteps(steps.length);
    }
  }, [steps, animateOnMount]);

  if (!steps || steps.length === 0) return null;

  const stepsToDisplay = animateOnMount ? steps.slice(0, visibleSteps) : steps;

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-300 mb-3">Agent Activity</h3>
      <ul className="space-y-2">
        {stepsToDisplay.map((step, index) => (
          <li
            key={index}
            className={`flex items-start gap-3 ${animateOnMount ? 'animate-fade-in-up' : ''}`}
            style={{ animationDelay: animateOnMount ? `${index * 100}ms` : undefined }}
          >
            <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-400">{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};