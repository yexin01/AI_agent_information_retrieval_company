import React from 'react';
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

  const allYears = [
    ...revenue.map(d => d.year),
    ...netIncome.map(d => d.year),
    ...cashflow.map(d => d.year),
  ];
  const uniqueYears = Array.from(new Set(allYears)).sort((a, b) => a - b);
  
  const allValues = [
    ...revenue.map(d => parseFinancialValue(d.value)),
    ...netIncome.map(d => parseFinancialValue(d.value)),
    ...cashflow.map(d => parseFinancialValue(d.value)),
  ].filter((v): v is number => v !== null);

  if (allValues.length === 0) {
    return (
        <div className="text-center text-slate-500 p-8 bg-slate-900/50 rounded-lg border border-slate-700">
            No chart data available.
        </div>
    );
  }

  const maxVal = Math.max(...allValues.map(Math.abs));
  
  const legendItems = [
    { label: 'Revenue', color: 'bg-cyan-500' },
    { label: 'Net Income', color: 'bg-violet-500' },
    { label: 'Cash Flow', color: 'bg-green-500' },
  ];

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
        <div className="flex justify-center gap-4 mb-4">
            {legendItems.map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
        <div className="flex justify-between items-end gap-2 h-72 border-b border-slate-600 pb-2">
        {uniqueYears.map(year => {
            const revData = revenue.find(d => d.year === year);
            const incData = netIncome.find(d => d.year === year);
            const cfData = cashflow.find(d => d.year === year);
            
            const revValue = revData ? parseFinancialValue(revData.value) : null;
            const incValue = incData ? parseFinancialValue(incData.value) : null;
            const cfValue = cfData ? parseFinancialValue(cfData.value) : null;

            const Bar = ({ value, color, originalValue }: { value: number | null; color: string; originalValue: string; }) => {
                if (value === null) {
                    return (
                        <div className="group relative w-full h-full flex items-end justify-center">
                            <div className="w-full h-[2px] bg-slate-700/50 rounded-t-sm"></div>
                            <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                N/A
                            </div>
                        </div>
                    );
                }
                
                const height = maxVal > 0 ? (Math.abs(value) / maxVal) * 100 : 0;
                const isNegative = value < 0;
                return (
                    <div className="group relative w-full h-full flex items-end justify-center">
                        <div
                            className={`w-full rounded-t-sm transition-all duration-300 ${isNegative ? 'bg-red-500' : color}`}
                            style={{ height: `${height}%` }}
                        ></div>
                        <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {originalValue}
                        </div>
                    </div>
                );
            };

            return (
                <div key={year} className="flex flex-col items-center flex-1 h-full gap-2 pt-4">
                    <div className="flex-grow w-full flex items-end gap-1">
                        <Bar value={revValue} color="bg-cyan-500" originalValue={revData?.value || 'N/A'}/>
                        <Bar value={incValue} color="bg-violet-500" originalValue={incData?.value || 'N/A'}/>
                        <Bar value={cfValue} color="bg-green-500" originalValue={cfData?.value || 'N/A'}/>
                    </div>
                    <span className="text-xs text-slate-400">{year}</span>
                </div>
            );
        })}
        </div>
        <div className="text-xs text-slate-500 text-center mt-2">
            Amounts in USD. Hover over bars for exact values.
        </div>
    </div>
  );
};
