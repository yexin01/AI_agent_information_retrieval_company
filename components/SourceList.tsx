import React from 'react';
import { Source } from '../types';
import { ArrowTopRightOnSquareIcon } from './icons/ArrowTopRightOnSquareIcon';

interface SourceListProps {
  sources: Source[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    // This state should no longer be reachable if the service correctly throws an error.
    // Returning null is cleaner than displaying a confusing message.
    return null;
  }

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-300 mb-3">Sources</h3>
      <ul className="space-y-2">
        {sources.map((source, index) => (
          <li key={index}>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 hover:underline transition-colors duration-200"
            >
              <span className="truncate">{source.title || source.uri}</span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4 flex-shrink-0 opacity-70 group-hover:opacity-100" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};