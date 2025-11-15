import React, { useState } from 'react';
import { HistoricalDataPoint } from '../types';

interface FinancialChartProps {
  data: {
    revenue: HistoricalDataPoint[];
    netIncome: HistoricalDataPoint[];
    cashflow: HistoricalDataPoint[];
  };
}

const parseFinancialValue = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  if (typeof value !== 'string') return null;

  let str = value.trim();
  if (str === '' || str.toLowerCase() === 'n/a' || str === '-') return null;

  let multiplier = 1;

  if (str.startsWith('(') && str.endsWith(')')) {
    multiplier = -1;
    str = str.slice(1, -1);
  }

  str = str.toLowerCase()
    .replace(/,/g, '') 
    .replace(/\s*usd|\s*eur|\s*gbp|\$|€|£/g, '');

  const lastChar = str.slice(-1);
  if (['k', 'm', 'b', 't'].includes(lastChar)) {
    switch (lastChar) {
      case 'k': multiplier *= 1e3; break;
      case 'm': multiplier *= 1e6; break;
      case 'b': multiplier *= 1e9; break;
      case 't': multiplier *= 1e12; break;
    }
    str = str.slice(0, -1);
  }

  const num = parseFloat(str);
  if (isNaN(num)) {
    return null;
  }

  return num * multiplier;
};

export const FinancialChart: React.FC<FinancialChartProps> = ({ data }) => {
  const { revenue, netIncome, cashflow } = data;

  const [visibility, setVisibility] = useState({
    revenue: true,
    netIncome: true,
    cashflow: true,
  });

  const toggleVisibility = (series: keyof typeof visibility) => {
    setVisibility(prev => {
        const nextState = { ...prev, [series]: !prev[series] };
        // Prevent hiding the last visible series
        const numVisible = Object.values(nextState).filter(Boolean).length;
        return numVisible > 0 ? nextState : prev;
    });
  };

  const allYears = [
    ...revenue.map(d => d.year),
    ...netIncome.map(d => d.year),
    ...cashflow.map(d => d.year),
  ];
  const uniqueYears = Array.from(new Set(allYears)).sort((a, b) => a - b);
  
  const allValues = [
    ...(visibility.revenue ? revenue.map(d => parseFinancialValue(d.value)) : []),
    ...(visibility.netIncome ? netIncome.map(d => parseFinancialValue(d.value)) : []),
    ...(visibility.cashflow ? cashflow.map(d => parseFinancialValue(d.value)) : []),
  ].filter((v): v is number => v !== null);

  const hasAnyData = [...revenue, ...netIncome, ...cashflow].some(d => parseFinancialValue(d.value) !== null);

  if (!hasAnyData) {
    return (
        <div className="text-center text-slate-500 p-8 bg-slate-900/50 rounded-lg border border-slate-700">
            No chart data available.
        </div>
    );
  }

  const maxVal = allValues.length > 0 ? Math.max(...allValues.map(Math.abs)) : 1;
  
  const legendItems = [
    { label: 'Revenue', color: 'bg-cyan-500', key: 'revenue' as const },
    { label: 'Net Income', color: 'bg-violet-500', key: 'netIncome' as const },
    { label: 'Cash Flow', color: 'bg-green-500', key: 'cashflow' as const },
  ];

  const Bar = ({ value, color }: { value: number | null; color:string; }) => {
    if (value === null) {
        return (
            <div className="w-full h-full flex items-end justify-center">
                <div className="w-full h-[2px] bg-slate-700/50 rounded-t-sm"></div>
            </div>
        );
    }
    
    const height = maxVal > 0 ? (Math.abs(value) / maxVal) * 100 : 0;
    const isNegative = value < 0;

    return (
        <div className="w-full h-full flex items-end justify-center">
            <div
                className={`w-full rounded-t-sm transition-all duration-300 ${isNegative ? 'bg-red-500' : color}`}
                style={{ height: `${height}%` }}
            ></div>
        </div>
    );
  };

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
        <div className="flex justify-center flex-wrap gap-2 mb-4">
            {legendItems.map(item => (
                <button 
                    key={item.key}
                    onClick={() => toggleVisibility(item.key)}
                    className={`flex items-center gap-2 text-xs rounded-full px-3 py-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                        visibility[item.key] 
                        ? 'text-slate-200 bg-slate-700' 
                        : 'text-slate-500 bg-slate-800 hover:bg-slate-700'
                    }`}
                    aria-pressed={visibility[item.key]}
                >
                    <div className={`w-3 h-3 rounded-sm ${item.color} ${!visibility[item.key] && 'opacity-30'}`}></div>
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
        <div className="flex justify-between items-end gap-2 h-72 border-b border-slate-600 pb-2">
        {uniqueYears.map(year => {
            const revData = revenue.find(d => d.year === year);
            const incData = netIncome.find(d => d.year === year);
            const cfData = cashflow.find(d => d.year === year);
            
            const revValue = visibility.revenue && revData ? parseFinancialValue(revData.value) : null;
            const incValue = visibility.netIncome && incData ? parseFinancialValue(incData.value) : null;
            const cfValue = visibility.cashflow && cfData ? parseFinancialValue(cfData.value) : null;

            return (
                <div key={year} className="group relative flex flex-col items-center flex-1 h-full gap-2 pt-4">
                    <div className="absolute bottom-full mb-2 w-max px-3 py-2 bg-slate-950 border border-slate-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <p className="font-bold text-sm mb-1 text-center">{year}</p>
                        <ul className="space-y-1 text-left">
                            {visibility.revenue && (
                                <li className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500 flex-shrink-0"></div>
                                    <span className="text-slate-400">Revenue:</span>
                                    <span className="font-semibold text-white">{revData?.value || 'N/A'}</span>
                                </li>
                            )}
                            {visibility.netIncome && (
                                <li className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-sm bg-violet-500 flex-shrink-0"></div>
                                    <span className="text-slate-400">Net Income:</span>
                                    <span className="font-semibold text-white">{incData?.value || 'N/A'}</span>
                                </li>
                            )}
                            {visibility.cashflow && (
                                <li className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-sm bg-green-500 flex-shrink-0"></div>
                                    <span className="text-slate-400">Cash Flow:</span>
                                    <span className="font-semibold text-white">{cfData?.value || 'N/A'}</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="flex-grow w-full flex items-end gap-1">
                        <Bar value={revValue} color="bg-cyan-500"/>
                        <Bar value={incValue} color="bg-violet-500"/>
                        <Bar value={cfValue} color="bg-green-500"/>
                    </div>
                    <span className="text-xs text-slate-400">{year}</span>
                </div>
            );
        })}
        </div>
        <div className="text-xs text-slate-500 text-center mt-2">
            Amounts in USD. Hover over a year for details.
        </div>
    </div>
  );
};