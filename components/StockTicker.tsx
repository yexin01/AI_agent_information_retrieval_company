import React from 'react';
import { StockData } from '../types';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { ChartPieIcon } from './icons/ChartPieIcon';

interface StockTickerProps {
  data: StockData;
}

export const StockTicker: React.FC<StockTickerProps> = ({ data }) => {
  const { price, change, change_percent, market_cap, chart_url } = data;

  // Check for valid change data to determine color and icon
  const changeValue = change ? parseFloat(change.replace('+', '')) : NaN;
  const isChangeNumeric = !isNaN(changeValue);
  const isPositive = isChangeNumeric && changeValue >= 0;

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex flex-wrap justify-between items-center gap-4">
      <div className="flex items-baseline gap-4">
        <p className="text-3xl font-bold text-white">{price && price !== 'N/A' ? price : 'N/A'}</p>
        {isChangeNumeric ? (
          <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <ArrowUpIcon className="w-5 h-5" /> : <ArrowDownIcon className="w-5 h-5" />}
            <span>{change} ({change_percent})</span>
          </div>
        ) : (
          <div className="font-semibold text-slate-400">
            <span>Change: N/A</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-slate-400">Market Cap</p>
          <p className="font-semibold text-white">{market_cap && market_cap !== 'N/A' ? market_cap : 'N/A'}</p>
        </div>
        {chart_url && chart_url !== 'N/A' && (
          <a
            href={chart_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200"
          >
            <ChartPieIcon className="w-5 h-5" />
            <span>View Chart</span>
          </a>
        )}
      </div>
    </div>
  );
};
