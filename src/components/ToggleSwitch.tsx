import React from 'react';

interface ToggleSwitchProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, icon, enabled, onChange }) => {
  return (
    <div 
      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer"
      onClick={() => onChange(!enabled)}
    >
      <div className="flex items-center gap-3">
        <div className="text-slate-400">{icon}</div>
        <div>
          <p className="font-semibold text-sm text-slate-200">{label}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${enabled ? 'bg-cyan-600' : 'bg-slate-600'}`}
      >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
};
