import React from 'react';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';

interface ThemeToggleProps {
    isDark: boolean;
    toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors border backdrop-blur-sm group ${isDark
                    ? 'bg-white/10 hover:bg-white/20 border-white/10'
                    : 'bg-slate-200/50 hover:bg-slate-300/50 border-slate-300/50'
                }`}
            aria-label="Toggle theme"
        >
            {isDark ? (
                <SunIcon className="w-6 h-6 text-yellow-300 group-hover:text-yellow-200 transition-colors" />
            ) : (
                <MoonIcon className="w-6 h-6 text-slate-600 group-hover:text-slate-800 transition-colors" />
            )}
        </button>
    );
};
