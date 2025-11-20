import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { SearchIcon } from './icons/SearchIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon className="w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a company (e.g. Apple, Tesla, Microsoft)..."
        disabled={isLoading}
        className={cn(
          "w-full pl-12 pr-32 py-4 bg-slate-900/50 border border-white/10 rounded-xl",
          "text-lg text-white placeholder:text-slate-500",
          "focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none",
          "transition-all duration-300 ease-out",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:bg-slate-900/70 hover:border-white/20"
        )}
      />
      <div className="absolute inset-y-0 right-2 flex items-center">
        <button
          type="submit"
          disabled={isLoading || !query}
          className={cn(
            "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300",
            isLoading || !query
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-cyan-500 text-white hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] active:scale-95"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <SpinnerIcon className="w-4 h-4 animate-spin" />
              <span>Searching</span>
            </div>
          ) : (
            <span>Search</span>
          )}
        </button>
      </div>
    </form>
  );
};
