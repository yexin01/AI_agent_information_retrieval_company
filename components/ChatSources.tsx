import React from 'react';
import { Source } from '../types';
import { ArrowTopRightOnSquareIcon } from './icons/ArrowTopRightOnSquareIcon';

interface ChatSourcesProps {
  sources: Source[];
}

export const ChatSources: React.FC<ChatSourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  // Remove duplicate sources based on URI
  const uniqueSources = sources.filter((source, index, self) =>
    index === self.findIndex((s) => s.uri === source.uri)
  );

  return (
    <div className="mt-3 pt-2 border-t border-slate-600/50">
      <h4 className="text-xs font-semibold text-slate-300 mb-1.5">Sources:</h4>
      <ul className="space-y-1">
        {uniqueSources.map((source, index) => (
          <li key={index}>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-1.5 text-cyan-400/90 hover:text-cyan-300 hover:underline text-xs"
              title={source.uri}
            >
              <ArrowTopRightOnSquareIcon className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-70 group-hover:opacity-100" />
              <span className="truncate">{source.title || source.uri}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};